import store from '../src/store'
import Web3 from 'web3'
import contract from 'truffle-contract'
import contractJSON from '../build/contracts/CampaignManager.json'
const Contract = contract(contractJSON)

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider)
    Contract.setProvider(web3.currentProvider)
} else {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    Contract.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'))
}

let contractInstance

const loadCampaignManager = async (c) => {
    contractInstance = await Contract.at("0xc2d4a7b3024479a6b2b50864c04cbb5f52cb8700")
    console.log("Contract Loaded")
}


const createNewCampaign = async (_startingTime, _endingTime, _goal, _cap, _ipfsHash) => {
    return await contractInstance.createCampaign(_startingTime,
        _endingTime,
        _goal,
        _cap,
        _ipfsHash, {
            from: store.state.defaultEthWallet,
            gasPrice: 2000000000,
            gas: '2000000'
        })
}

const getNumberOfCampaigns = async () => {
    return await contractInstance.campaignCount()
}

const fundCampaign = async (_campaignID, _value) => {
    await contractInstance.fundCampaign(_campaignID, {
        from: store.state.defaultEthWallet,
        gasPrice: 2000000000,
        gas: '2000000',
        value: _value
    })
}

const reduceDonation = async (_campaignID, _value) => {
    await contractInstance.reduceDonation(_campaignID, _value, {
        from: store.state.defaultEthWallet,
        gasPrice: 2000000000,
        gas: '2000000',
    })
}

const refundFailedCampaign = async (_campaignID) => {
    await contractInstance.reduceDonation(_campaignID, {
        from: store.state.defaultEthWallet,
        gasPrice: 2000000000,
        gas: '2000000',
    })
}

const withdrawCampaignFunds = async (_campaignID) => {
    await contractInstance.withdrawCampaignFunds(_campaignID, {
        from: store.state.defaultEthWallet,
        gasPrice: 2000000000,
        gas: '2000000',
    })
}

const fetchCampaign = async (_campaignID) => {
    return await contractInstance.fetchCampaign(_campaignID)
}

export {
    loadCampaignManager,
    createNewCampaign,
    getNumberOfCampaigns,
    fundCampaign,
    reduceDonation,
    refundFailedCampaign,
    withdrawCampaignFunds,
    fetchCampaign
}