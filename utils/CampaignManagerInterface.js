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
    console.log(contractInstance.owner())
}


// const getSimpleStorageValue = async (c) => {
//     return c.get()
// }

// const setSimpleStorageValue = async (c) => {
//     const transaction = c.contract.set(c.value, {
//         from: c.from,
//         gasPrice: 2000000000,
//         gas: '2000000'
//     })
//     return transaction
// }

export {
    loadCampaignManager
}