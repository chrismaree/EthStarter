// Proxy logic is tested below. These tests dont need to verify the functionality
// of the CampaignManager that is verified in the CampaignManager.test.js. 
// We just need to test the ability to upgrade and forward logic here.

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
var ProxyContract = artifacts.require("./Proxy.sol");
var CampaignManager = artifacts.require("./CampaignManager.sol");
contract('ProxyContract', function (accounts) {

    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[1];
    const legitImplementationAddress = "0x9468B6a1035E3605Dd3B53a7D02d3212730bc65D";
    const mollyImplementationAddress = "0x703103cc1eEcF5cfcaf44Eaf8752bb9504526A76";
    const goal = ether(10)
    const cap = ether(15)
    const ipfsHash = "QmYA2fn8cMbVWo4v95RwcwJVyQsNtnEwHerfWR8UNtEwoE"
    
    before(async function () {
        const startingTime = (await latestTime()) + duration.weeks(1);
        const endingTime = startingTime + duration.weeks(1);
    })

    it('Proxy should be deployable and upgrade functionality restricted to the owner only', async () => {
        let proxy = await ProxyContract.new({
            from: owner
        })
        //set to somthing by the owner
        proxy.upgradeTo(legitImplementationAddress, {
            from: owner
        })
        let setAddress = await proxy.implementation()

        assert.equal(setAddress.toLowerCase(), legitImplementationAddress.toLowerCase(), "Address should be set to legit address")

        //try and change it by someone else should throw
        await expectThrow(proxy.upgradeTo(mollyImplementationAddress, {
            from: account1
        }), EVMRevert);
    })
    it('Contract calls should be correctly forward to implementation contract', async () => {
        // First, we spawn the proxy contract
        let proxy = await ProxyContract.new({
            from: owner
        })

        // Then, create a campaign manager
        campaignManager = await CampaignManager.new({
            from: account1
        });

        // Next, we assign the proxy to forward calls to the original campaign Manager created on line 59
        await proxy.upgradeTo(campaignManager.address, {
            from: owner
        })

        // Next, we will make a campaign on the campaign manager from the proxy interface to check
        // that all logic is forwarded to the correct contract
        let proxyCampaignManager = await CampaignManager.at(proxy.address)

        //Create the campaign, from the interface of the proxy
        await proxyCampaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash)

        //read back the number of campaigns created to check that the call was forwared correctly
        let numberOfCampaigns = await proxyCampaignManager.campaignCount()
        assert.equal(numberOfCampaigns, 1, "Should have deployed exactly 1 campaign")
    })

    it('Proxy should revert if trying to upgrade to the same address', async () => {
        // First, we spawn the proxy contract
        let proxy = await ProxyContract.new({
            from: owner
        })

        // Then, create a campaign manager
        campaignManager = await CampaignManager.new({
            from: account1
        });

        await proxy.upgradeTo(campaignManager.address, {
            from: owner
        })
        
        //Should revert if we upgrade to the same address again
        await expectThrow(proxy.upgradeTo(campaignManager.address, {
            from: owner
        }), EVMRevert);

    });

    it('Proxy should revert if implementation address is 0x', async () => {
        // First, we spawn the proxy contract
        let proxy = await ProxyContract.new({
            from: owner
        })
        // Create an instance of the campaign manager. BUT we have not set the address of the campaign manager
        // in the proxy implementation address. if we try use this, it should revert from the require preventing the
        // use on unassigned proxies.
        let proxyCampaignManager = await CampaignManager.at(proxy.address)

        await expectThrow(proxyCampaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash),EVMRevert)
    });

    it('Proxy should correctly return a revert if the implementation contract also reverts', async () => {
        // First, we spawn the proxy contract
        let proxy = await ProxyContract.new({
            from: owner
        })

        // Then, create a campaign manager
        campaignManager = await CampaignManager.new({
            from: account1
        });

        // Next, we assign the proxy to forward calls to the original campaign Manager created on line 59
        await proxy.upgradeTo(campaignManager.address, {
            from: owner
        })

        // Next, we will make a campaign on the campaign manager from the proxy interface to check
        // that all logic is forwarded to the correct contract
        let proxyCampaignManager = await CampaignManager.at(proxy.address)

        // We will now try and call a function on the campaign manager that should fail to check that the proxy correctly
        // returns the revert. This is an invalid campaign creation as the cap and goal have been switch resulting in invalid inputs
        await expectThrow(proxyCampaignManager.createCampaign(startingTime, endingTime, cap, goal, ipfsHash), EVMRevert)
    })
});