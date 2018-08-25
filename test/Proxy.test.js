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
var Proxy = artifacts.require("./Proxy.sol");

contract('Proxy', function (accounts) {

    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[1];

    it('Proxy should be deploable and upgrade functionality restricted to the owner only')
    porxy = await 

});