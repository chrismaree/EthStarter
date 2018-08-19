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
    const goal = ether(10)
    const cap = ether(15)
    const ipfsHash = "QmYA2fn8cMbVWo4v95RwcwJVyQsNtnEwHerfWR8UNtEwoE"

    before(async function () {
        await advanceBlock();
    });

    beforeEach(async function () {
        startingTime = (await latestTime()) + duration.weeks(1);
        endingTime = startingTime + duration.weeks(1);
        afterendingTime = endingTime + duration.seconds(1);
        campaignManager = await CampaignManager.deployed();
    });



    it('Constructor correctly deployes contract and assigns owner', async () => {
        const contractOwner = await campaignManager.owner()
        assert.equal(contractOwner, owner, 'Owner should be set on construction');

        const startingCampaignCount = await campaignManager.campaignCount()
        assert.equal(startingCampaignCount, 0, 'Campaign Manager should start with zero campaigns');
    })

    it('Create Campaign only alows valid inputs', async () => {
        // Valid inputs should add a new entry to the array
        await campaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash, {from: manager})
        let campaignCount = await campaignManager.campaignCount()
        assert.equal(campaignCount,1,'New Campaign Should have been added to the array')

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
});