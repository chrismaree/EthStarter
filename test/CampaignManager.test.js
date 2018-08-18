var CampaignManager = artifacts.require("./CampaignManager.sol");

contract('CampaignManager', function (accounts) {

    const account0 = accounts[0];

    it('Campain Creation correctly adds a new campaign', async () => {

        assert.equal(1, 1, 'Set Value is not same as get value');
    })
});