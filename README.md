# EthStarter
**Decentralized, peer to peer funding platform for creatives, charities and open source projects.**

### Overview
Ethstarter enables individuals to create new campaigns and publish them on an open platform. Key campaign logic is stored within Ethereum Smart contracts and additional information (such as images, text and embedded content) is stored on IPFS. Any other user can then fund the campaign during the funding period. Ether is locked in the contract until the end of the funding period at which point the campaign manger can withdraw from the campaign, if the campaign was successful. If the campaign does not receive enough donations during the funding period, the donors can withdraw their contributions after the end of the campaign. The whole process occurs without the need for a central authority to oversee any aspect of the exchange; the campaigns can be seen as a peer-to-peer exchange between the fund manager and the donors enabling a novel, trustless mechanism for funding projects!

###How to run the project
The smart contracts have been set up to compile and run with truffle. The front end was created with vuejs and elementsUI. Requirements to run the project are: `Node>=8.11`,`npm` and `truffle`. To begin with, we need to install all required libraries and utilities. From the root of the repo, run:

    npm install.

Contracts have been deployed to the Rinkeby. Addresses can be found in `deployed_addresses.txt` To interact with the contracts on the local machine:
  
    truffle compile
    truffle test
    truffle migrate

To test code coverage, from the root directory, run:
    
    npm run coverage

Lastly, to interact with Dapp, from the root directory, after running `npm install`, run:
      
    npm run serve

The Dapp(same as in screenshots below) should open up on your local machine.

### Why
Current web2.0 funding platforms like Kickstater, Indigogo and others all suffer from the same underlying problems. Theses problems can be broken down into two main sections:

1. **Cost**: The current funding mechanisms take a cut from every project funded on the platform. Kickstarter, for example, takes 4% of all projects funding. Indigogo also takes 4% for sucessfuly funded projects but this cost jumps to 9% if the project is unsuccessful. EthStarter, on the other hand, takes no fees from Campaigns.
2. **Accessability**: Many projects are restricted to particular geographic regions. If you fall outside of these regions, you can't contribute to the projects. Clearly, if the project intends to sell products that require shipping, this needs to be taken into account but there is no reason that someone should not be able to contribute to charity or open source projects from anywhere in the world. Additionally, current funding platforms restrict the kind of projects that can be posted on them, resulting in many projects not making the cut. A curation mechanism for quality projects is important but this is out of the scope of this project.


### User Stories
The workflow and user interaction for Etherstarter is very simple. There are two broad categories of users: Campaign managers and campaign donors. Each users story will be shown with some accompanying sample campaigns.

#### Campaign manager:

1. The user accesses the system through a web3 enabled browser (metamask, Status, Cipher etc.) to create a new campaign. The user fills in all relevant information. They are able to speify: the name of the campaign, where it is occuring, a description, the duration of the funding period, the type of campaign, the goal and cap of the campaign. The user is also able to upload an image, used to represent the project as a whole. The user then have the ability to write as much text as they wish to describe the project. This section enables fully customisable typography, from bold/italic/underline to imbedited images, Youtube videos and any other HTML representable content (basically, you can put anything in here.)
<p align="center">  
  <img
   src="https://github.com/SoIidarity/EthStarter/blob/master/img/DatePicker.png?raw=true" alt="Date Picker"/>
  <br>
  <i>Date Picker</i>. Select the start and end date/time for the campaign.
</p>
<p>
  <img src="https://github.com/SoIidarity/EthStarter/blob/master/img/CreateCampaignCats.png?raw=true" alt="Date Picker"/>
  <br>
  <i>Create New Campaign</i>
  
</p>

1. They Click create on the project, publishing it to the Blockchain and IPFS.
2. The project is now publicly viewable by anyone on the platform and can be funded by anyone. Clearly, a user can only fund the project once the funding period starts.
3. As the manager, you are given extra controls, such as the ability to withdraw the funds from the campaign. This functionality is restricted until after the end of the campaign period. Additionally, withdraw is only enabled if the campaign was successful.

#### Campaign Donor

1. Donors to the platform can view all currently listed campaigns. Below is a screenshot of a silly example of a sample project.
<p align="center">
  <img src="https://github.com/SoIidarity/EthStarter/blob/master/img/buffHourse.png?raw=true" alt="Date Picker"/>
  <i>Non-Funded Campaign</i>. Note the embeded youtube video and that the status is "Not Started"
  <br>
</p>

1. They can then contribute to any project they see fit by clicking the "Fund Campaign" button.
  <p align="center">
  <img src="https://github.com/SoIidarity/EthStarter/blob/master/img/buffHourseFunded.png?raw=true" alt="Date Picker"/>
  <i>Funded campaign</i>. Note that the goal and cap has progressed and that the time bargraph is at 93%. Also note that as this user has contributed, the have the ability to withdraw an amount from the Campaign. The imbedded youtube video plays directly from Youtube.
  <br>
</p>

2. The donor can choose to reduce their donation, if they wish, after the donation period. This can *only* be done if the reduction does not result in a successful campaign becoming unsuccessful.
3. In the event of an unsuccessful campaign, the donor is able to withdraw their funds.

### Design Patterns and Desicions. 
Key separation of concerns was employed at all levels. This implementation is detailed [here](https://www.google.com)


### Security Tools / Common Attacks
EthStarter has been designed to sufficiently prevent common attack vectors. The simplicity in design means that most normal attack vectors do not apply, such as Race condition, Transaction-Ordering Dependence (TOD) and Front Running. There are, however, three sections of the system design that could result in potential attack vectors. Each of these possible vulnerabilities is discussed as well as how EthStarter mitigates against them.

1. **Timestamp Dependence**
EthStarter uses the notion of "now" in its design. This can be manipulated by miners but is not a concern for the safety of the system as there are no potential vulnerabilities arising from a ~30 second variance in the start/end time of the campaign.
2. **Integer Overflow and Underflow**
The balances of each campaign is stored using a uint. These *could* potentially overflow/underflow. The case of an overflow is imposible as this value corisponds to ether deposited and there is not enough ether in circulation to cause an overflow. Underflows are prevented by sufficient checks within require statements. The correctness of these requires is verified with unit tests.
3. **Forcibly Sending Ether to a Contract**
It is conceivable that someone could forcibly send ether the the campaign. This will, however, achieve nothing past the attacker loosing their ether. There is no core logic based on this total value of the contract but rather each campaign has their own independent wallet uint.
4. **Reentrancy attacks**
The EthStarter contract is invulnerable to Reentrancy attacks due to correct ordering of operations in withdraw type statements and the use of transfer() to prevent any external code from being executed.

### Smart Contract Testing
Extensive unit tests have been written for the key logic of the system. Code coverage has also been calculated and the results can be seen below. Both Contracts included in the project yield 100% test coverage.

    |----------------------|----------|----------|----------|----------|----------------|
    |File                  |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
    |----------------------|----------|----------|----------|----------|----------------|
    | contracts/           |      100 |    79.17 |      100 |      100 |                |
    |  CampaignManager.sol |      100 |    81.82 |      100 |      100 |                |
    |  Proxy.sol           |      100 |       50 |      100 |      100 |                |
    |----------------------|----------|----------|----------|----------|----------------|
    |All files             |      100 |    79.17 |      100 |      100 |                |
    |----------------------|----------|----------|----------|----------|----------------|


### System Limitations
EthStarter was build using one main smart contract to store all campaign information. Design was kept intentionally simple to demonstrate the basic principles of the system. Future iterations would involve more complex designs such as a community driven campaign curation process and some form of verification for quality of projects added to the system. Additionally, the separation of logic and storage layers.
