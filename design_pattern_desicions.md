#Design Decisions
This document aims to give a high level overview of the decisions made in both the design and construction of EthStarter. Future considerations are also discussed.

## How Ethstarter works
There are three main parts to the EthStater platform: Ethereum Smart contract, IPFS storage and the vuejs frontend. Each will be discussed intern to justify design decision and to provide a high level overview of the solution.

Starting at the user front end, the user accesses the website via a web3 enabled browser. The content within the new campaign is uploaded to IPFS using JSON formatting. Images are encoded to bitstreams. Custom HTML input is facilitated by TinyMCE. Rich media within the TinyMCE window is encoded to a byte stream as well. 

The new campaign JSON Blob is then uploaded to IPFS using js-ipfs with the use of the Infura Access point. The hash of this is then taken and fed into the createCampaign function (within the CampaignManager), along with all other key information like the start/end timestamps. Unix timestamps are used for all date storing and manipulation as Solidity uses unix timestamps for now.

All CampaignManager calls are fed via a Proxy contract to enable upgradability. More on this design decision is discussed later.

On the retrieval of Campaigns, the Vue frontend requests the number of campaigns from the smart contract. It then itterates through all campaigns, creating a new Vue component for each. Each component requests information from IPFS and renders this to the front end.

Apon interacting with a deployed campaign, the frontend calls contract functions directly. Input sanitization is done on both the front end and within the contracts.

## System Maintainability and Design Decision
The system has been designed to be as maintainable as possible, employing separation of concerns in every aspect of the design. The smart contracts employ a proxy contract that forwards all contract calls to a defined contract Address. This is implemented through the use of delegate calls, thus creating upgradeable stateful contracts. Only the owner can change the address that the contracts point to. Future iterations Would involve the usage of dedicated separate storage for campaign information, further separating logic and storage. The diagrams below outline this design paradigm.

<p align="center">
  <img src="https://github.com/SoIidarity/EthStarter/blob/master/img/SystemDiagram.png?raw=true" alt="Date Picker"/>
  <i>System Design Diagram</i>. The current version implements upgradability through a delegate call proxy contract. Future versions would incorporate separation of Data storage from the main logic.
  <br>
</p>


## Front End
The user interface was made using Vuejs to enable separation of concerns between layers. Utility scripts, such as `CampaignManagerInterface.js` and `web3Service.js` remove the front end from needing to know how to interact with the smart contracts. The front end calls assessors/mutator from exported functions from these utilities.

The front end embodies a component design paradigm meaning that each key UI element is a discrete entity that is used within other elements enabling modular upgrade and styling of each UI component. Additionally, this makes the process of adding more functionality easier as the project grows and scales.

ElementUI was used for styling, not that much was done.

## Other Design Considerations
An **Emergency stop** Paradigm was used enabling core functionality to be stopped if the contract is detected to be faulty. There are two different emergency stops implemented in EthStarter: one to stop the ability to fund the campaigns and one to stop the creation of new campaigns. Both stops do not prevent the withdrawal of funds using the normal procedure as to not prevent funds from getting locked up within the contracts.
