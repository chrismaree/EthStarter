var CampaignManager = artifacts.require("CampaignManager");

module.exports = function (deployer) {
    deployer.deploy(CampaignManager);
};