var CampaignManagerContract = artifacts.require("CampaignManager");
var ProxyContract = artifacts.require("Proxy")

module.exports = function (deployer) {
    // First, we deploy the campaign manager contract
    deployer.deploy(CampaignManagerContract).then((value) => {
        // extract the address from the deployed contract
        let deployedCampaignManagerAddress = value.address;
        // Then, deploy the Proxy Contract
        deployer.deploy(ProxyContract).then((value) => {
            // Create an instance of the proxy contract so we can assign the campaignManager to it
            let proxyInstance = ProxyContract.at(value.address)
            // set the instance of the campaign manager to the proxy
            proxyInstance.upgradeTo(deployedCampaignManagerAddress)
            console.log("Proxy contract set to deployed CampaignManager!")
        })
    });
};