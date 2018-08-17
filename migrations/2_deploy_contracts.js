var SimpleStorage = artifacts.require("SimpleStorage");

module.exports = function (deployer) {
    deployer.deploy(SimpleStorage,0); //spesify the constructor as 0
};