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
    it('Test that contract calls are correctly forward', async () => {
        let proxy = await ProxyContract.new({
            from: owner
        })
        campaignManager = await CampaignManager.new({from: account1});
        proxy.upgradeTo(campaignManager.address, {
            from: owner
        })

        let campaignManagerOwnerAddress = await campaignManager.owner()

        console.log(campaignManagerOwnerAddress)
        
    })

});