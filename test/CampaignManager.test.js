// All contract functionality is fully testing in the tests below. The testing structure
// is to address each major usecase of the contract, in accordance with the contract
// interface. The time of the blockchain is modified using the advanceToBlock, increseTime
// and latestTime javascript helpers to simulate particular points in time.

const {
    ether
} = require('./helpers/ether');
const {
    advanceBlock
} = require('./helpers/advanceToBlock');
const {
    increaseTimeTo,
    duration
} = require('./helpers/increaseTime');
const {
    latestTime
} = require('./helpers/latestTime');
const {
    expectThrow
} = require('./helpers/expectThrow');
const {
    EVMRevert
} = require('./helpers/EVMRevert');
var CampaignManager = artifacts.require("./CampaignManager.sol");

contract('CampaignManager', function (accounts) {

    const owner = accounts[0];
    const manager = accounts[1];
    const funder1 = accounts[2];
    const funder2 = accounts[3];
    const validDonation = ether(5);
    const goal = ether(10)
    const cap = ether(15)
    const ipfsHash = "QmYA2fn8cMbVWo4v95RwcwJVyQsNtnEwHerfWR8UNtEwoE"


    before(async function () {
        await advanceBlock();
    });
    // before each, the time must be recalculated to get exact values. This is not strictly needed
    // but addes a level of precision to the tests.
    beforeEach(async function () {
        startingTime = (await latestTime()) + duration.weeks(1);
        duringCampaignTime = startingTime + duration.days(1)
        endingTime = startingTime + duration.weeks(1);
        afterEndingTime = endingTime + duration.days(1);
        campaignManager = await CampaignManager.new();
    });

    it('Constructor correctly deployes contract and assigns owner', async () => {
        const contractOwner = await campaignManager.owner()
        assert.equal(contractOwner, owner, 'Owner should be set on construction');

        const startingCampaignCount = await campaignManager.campaignCount()
        assert.equal(startingCampaignCount, 0, 'Campaign Manager should start with zero campaigns');
    })

    it('Create Campaign only allows valid inputs', async () => {
        // Valid inputs should add a new entry to the array
        await campaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash, {
            from: manager
        })
        let campaignCount = await campaignManager.campaignCount()
        assert.equal(campaignCount, 1, 'New Campaign Should have been added to the array')


        //Next, verify that all values are set to the correct values after initialisation
        //The campaignID is the zeroth position in the array as we have added exactly 1 campaign
        let campaignID = await campaignManager.campaignCount() - 1

        let campaignValues = await campaignManager.fetchCampaign.call(campaignID)

        assert.equal(campaignValues[0], manager, "Manager should have been set")
        assert.equal(campaignValues[1]['c'][0], startingTime, "Manager should have been set")
        assert.equal(campaignValues[2]['c'][0], endingTime, "Manager should have been set")
        assert.equal(campaignValues[3]['c'][0], 0, "Balance should be zero")
        assert.equal(campaignValues[4]['c'][0], goal['c'][0], "Goal should be set correctly")
        assert.equal(campaignValues[5]['c'][0], cap['c'][0], "cap should be set correctly")
        assert.equal(campaignValues[6]['c'][0], 0, "State should be set to not started(0)")
        assert.equal(campaignValues[7].length, 0, "There should be no contributers")
        assert.equal(campaignValues[8], ipfsHash, "IPFS hash should be correct")

        //check that if the start time is after the end time (swapped start and end times) constructor throws
        await expectThrow(campaignManager.createCampaign(endingTime, startingTime, goal, cap, ipfsHash, {
            from: manager
        }), EVMRevert);

        // Checks that even if the end time is > than the starting time, but both are less than current time
        // the construction of a new campaign should still thow
        startingTime = 100
        endingTime = 150
        await expectThrow(campaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash, {
            from: manager
        }), EVMRevert);

        // lastly, check the goal/cap modifier to prevent the cap>goal
        await expectThrow(campaignManager.createCampaign(startingTime, endingTime, cap, goal, ipfsHash, {
            from: manager
        }), EVMRevert);

        //Count should still be 1 as no new campaign should have been created in the previous tests
        campaignCount = await campaignManager.campaignCount()

        assert.equal(campaignCount, 1, 'New Campaign Should have been added to the array')
    })

    it('Funding Campaign only allows valid inputs', async () => {
        // First, we need a campaign to test against
        await campaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash, {
            from: manager
        })
        //The campaignID is the zeroth position in the array as we have added exactly 1 campaign
        let campaignID = await campaignManager.campaignCount() - 1

        // Should NOT pass as the current time is less than the defined starting time above for the campaign
        await expectThrow(campaignManager.fundCampaign(campaignID, {
            from: funder1,
            value: validDonation
        }), EVMRevert);

        // Set time to during the campaign and then try fund it. Check that can accept funds and they are correctly recived
        await increaseTimeTo(duringCampaignTime);
        await campaignManager.fundCampaign(campaignID, {
            from: funder1,
            value: validDonation
        })

        let campaignValues = await campaignManager.fetchCampaign.call(campaignID)

        assert.equal(campaignValues[3]['c'][0], validDonation['c'][0], "Balance should be equal to the donation amount")
        assert.equal(campaignValues[6]['c'][0], 1, "State should be set to Started(1)")
        assert.equal(campaignValues[7].length, 1, "There should be 1 funder")
        assert.equal(campaignValues[7][0], funder1, "Only Funder address should be funder1")

        // We need to check that if the funder addes enough to exceed the cap, it fails. At this point, we are at 5 ether in the fund
        await expectThrow(campaignManager.fundCampaign(campaignID, {
            from: funder1,
            value: cap //This value doesent matter as long as it + the current balance is > than cap. just use cap to keep it simple
        }), EVMRevert);

        // Next, we set the time to after the funding period is done and once again try to fund the campaign. should not alow this
        await increaseTimeTo(afterEndingTime);

        await expectThrow(campaignManager.fundCampaign(campaignID, {
            from: funder1,
            value: validDonation
        }), EVMRevert);
    })
    it('Reduce Donation should only alow valid inputs', async () => {
        // First, we need a campaign to test against
        await campaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash, {
            from: manager
        })
        //The campaignID is the zeroth position in the array as we have added exactly 1 campaign
        let campaignID = await campaignManager.campaignCount() - 1

        // Set time to during the campaign and then try fund it.
        await increaseTimeTo(duringCampaignTime);
        await campaignManager.fundCampaign(campaignID, {
            from: funder1,
            value: validDonation
        })
        let campaignValues = await campaignManager.fetchCampaign.call(campaignID)
        assert.equal(campaignValues[3]['c'][0], validDonation['c'][0], "Balance should be equal to the donation amount")
        //Next, we want to reduce our donation by a set amount and check we get the ether back correctly and that the fund is reduced

        let responce = await campaignManager.reduceDontation(campaignID, (validDonation / 2), {
            from: funder1
        })
        
        campaignValues = await campaignManager.fetchCampaign.call(campaignID)
        assert.equal(campaignValues[3]['c'][0], (validDonation['c'][0]) / 2, "Balance should be equal to the half the original donation amount")

        // Need to check that the user cant withdraw more than they deposited. At this point, the user balance should be 2.5 ether. 
        // Withdrawing by another validDonation should make their balance negative. this should get rejected

        await expectThrow(campaignManager.reduceDontation(campaignID, validDonation, {
            from: funder1
        }), EVMRevert);

        // Next, we will fund the campaign unitl it has exceeded it's goal(but below the cap) and check that the user cant make a passing
        // campaign fail. After this funding, the fund should have a value of 12.5 eth. This is more than the goal but less than the cap
        await campaignManager.fundCampaign(campaignID, {
            from: funder2,
            value: validDonation * 2
        })

        campaignValues = await campaignManager.fetchCampaign.call(campaignID)
        assert.equal(campaignValues[3]['c'][0], ether(12.5)['c'][0], "Balance should be equal to the total deposited + the amount withdrawn")

        // Now get funder2 to try and withdraw more than 2.5 ether, making the balance of the fund < the goal of 10. This should throw as you
        // cant make a sucesseeding campaign fail with a withdraw
        await expectThrow(campaignManager.reduceDontation(campaignID, ether(3), {
            from: funder2
        }), EVMRevert);

        campaignValues = await campaignManager.fetchCampaign.call(campaignID)
        assert.equal(campaignValues[3]['c'][0], ether(12.5)['c'][0], "Balance should be equal to the total deposited + the amount withdrawn")

        // Last thing to check is that a doner cant withdraw after the campaign has finished
        await increaseTimeTo(afterEndingTime);
        await expectThrow(campaignManager.reduceDontation(campaignID, ether(3), {
            from: funder2
        }), EVMRevert);

    })

    it('Withdraw Campaign Funds should only alow valid inputs', async () => {
        // First, we need a campaign to test against
        await campaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash, {
            from: manager
        })
        //The campaignID is the zeroth position in the array as we have added exactly 1 campaign
        let campaignID = await campaignManager.campaignCount() - 1

        // Set time to during the campaign and then try fund it.
        await increaseTimeTo(duringCampaignTime);
        await campaignManager.fundCampaign(campaignID, {
            from: funder1,
            value: validDonation * 2.5 //we want to fund the campaign such that it is above the goal but less than the cap. this = 12.5 ether
        })

        let campaignValues = await campaignManager.fetchCampaign.call(campaignID)
        assert.equal(campaignValues[3]['c'][0], validDonation['c'][0] * 2.5, "Balance should be equal to the donation amount")


        // Ensure that the manager can withdraw before the campaign has ended
        await expectThrow(campaignManager.withdrawCampaignFunds(campaignID, {
            from: manager
        }), EVMRevert);

        // Ensure that non-managers can't withdraw campaign funds
        await expectThrow(campaignManager.withdrawCampaignFunds(campaignID, {
            from: funder1
        }), EVMRevert);

        // Next, we set the time to be after the end of the campaign so the manager can try withdraw the funds
        await increaseTimeTo(afterEndingTime);

        await campaignManager.withdrawCampaignFunds(campaignID, {
            from: manager
        });

        campaignValues = await campaignManager.fetchCampaign.call(campaignID)
        assert.equal(campaignValues[6]['c'][0], 2, "State should be set to Funded(2)")

        // Ensure that the manager can't withdraw twice from the same campaign
        await expectThrow(campaignManager.withdrawCampaignFunds(campaignID, {
            from: manager
        }), EVMRevert);
    })

    it('Refund Failed Campaign should only alow valid inputs', async () => {
        // First, we need a campaign to test against
        await campaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash, {
            from: manager
        })
        //The campaignID is the zeroth position in the array as we have added exactly 1 campaign
        let campaignID = await campaignManager.campaignCount() - 1

        // Set time to during the campaign and then try fund it.
        await increaseTimeTo(duringCampaignTime);
        await campaignManager.fundCampaign(campaignID, {
            from: funder1,
            value: validDonation * 1.5 //we want to fund the campaign such that it is below the goal. 1.5* validDonation = 7.5eth
        })

        let campaignValues = await campaignManager.fetchCampaign.call(campaignID)
        assert.equal(campaignValues[3]['c'][0], validDonation['c'][0] * 1.5, "Balance should be equal to the donation amount")


        campaignValues = await campaignManager.fetchCampaign.call(campaignID)

        //Should not be able to call this until the campaign has ended so check that it reverts
        await expectThrow(campaignManager.refundFailedCampaign(campaignID, {
            from: funder1
        }), EVMRevert);

        await increaseTimeTo(afterEndingTime);

        await campaignManager.refundFailedCampaign(campaignID, {
            from: funder1
        })

        // Lastly, check that the user cant withdraw failed funds for a second time
        await expectThrow(campaignManager.refundFailedCampaign(campaignID, {
            from: funder1
        }), EVMRevert);
    })

    it('Update IPFS Hash should only alow valid inputs', async () => {
        // First, we need a campaign to test against
        await campaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash, {
            from: manager
        })
        // The campaignID is the zeroth position in the array as we have added exactly 1 campaign
        let campaignID = await campaignManager.campaignCount() - 1

        // The manager should only be able to change the hash if the campaign has not started yet
        let newHash = "NEW HASH"
        await campaignManager.updateIpfsHash(campaignID, newHash, {
            from: manager
        })
        campaignValues = await campaignManager.fetchCampaign.call(campaignID)
        assert.equal(campaignValues[8], newHash, "IPFS hash should be correct")

        let mollyHash = "BAD HASH"
        // Someone who is NOT the manager should not be able to change the hash
        await expectThrow(campaignManager.updateIpfsHash(campaignID, mollyHash, {
            from: funder1
        }), EVMRevert);
        campaignValues = await campaignManager.fetchCampaign.call(campaignID)
        assert.equal(campaignValues[8], newHash, "IPFS hash should NOT have changed from the one set by the manager")

        // Lastly check that the hash cant be changed after the campain has started
        await increaseTimeTo(duringCampaignTime);
        await expectThrow(campaignManager.updateIpfsHash(campaignID, ipfsHash, {
            from: manager
        }), EVMRevert);
    });

    it('Emergency Stops should stop associated functionality', async () => {
        // Standard creation of a campaign should be fine
        await campaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash, {
            from: manager
        })

        let campaignID = await campaignManager.campaignCount() - 1
        //Disable funding then fund. check throws
        await campaignManager.enableEmergencyStop_Funding({
            from: owner
        })
        await expectThrow(campaignManager.fundCampaign(campaignID, {
            from: funder1,
            value: validDonation
        }), EVMRevert);

        //Disable creation then create. check throws
        await campaignManager.enableEmergencyStop_Creation({
            from: owner
        })
        await expectThrow(campaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash, {
            from: manager
        }), EVMRevert);
    })
});