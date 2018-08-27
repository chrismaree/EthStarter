// Proxy logic is tested below. These tests dont need to verify the functionality
// of the CampaignManager that is verified in the CampaignManager.test.js. 
// We just need to test the ability to upgrade and forward logic here. Creating 5 tests
// for this contract is a bit silly so only the required functionality is tested to achive 100%
// Code coverage.

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

    it('Proxy should be deploable and upgrade functionality restricted to the owner only', async () => {
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
        
        const goal = ether(10)
        const cap = ether(15)
        const ipfsHash = "QmYA2fn8cMbVWo4v95RwcwJVyQsNtnEwHerfWR8UNtEwoE"
        const startingTime = (await latestTime()) + duration.weeks(1);
        const endingTime = startingTime + duration.weeks(1);

        //Create the campaign, from the interface of the proxy
        await proxyCampaignManager.createCampaign(startingTime, endingTime, goal, cap, ipfsHash)
        
        //read back the number of campaigns created to check that the call was forwared correctly
        let numberOfCampaigns = await proxyCampaignManager.campaignCount()
        assert.equal(numberOfCampaigns, 1, "Should have deployed exactly 2 campaign")
    })

});