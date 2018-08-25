var CampaignManagerContract = artifacts.require("CampaignManager");
var ProxyContract = artifacts.require("Proxy")

module.exports = function (deployer) {
    // deployer.deploy(CampaignManager);
    deployer.deploy(CampaignManagerContract).then((value) => {
        let deployedCampaignManagerAddress = value.address;
        deployer.deploy(ProxyContract).then((value) => {
            let proxyInstance = ProxyContract.at(value.address)
            proxyInstance.upgradeTo(deployedCampaignManagerAddress)
            console.log("Proxy contract set to deployed CampaignManager!")
        })
    });
    // console.log(address)
};