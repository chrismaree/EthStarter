pragma solidity ^0.4.24;

import "./Ownable.sol";

/** @title A managment contract to store and manage all Campains for the platform.
* This enables users to create new campagins and then other users can fund them.
* Users can only fund campains that are currently running(have started and not
* finished). If a user withdraws from a campaign, they can only do so if it does
* not result in the campaign no longer getting funded.
* @author Chris Maree - SoIdarity 
*/
contract CampaignManager is Ownable{
    /** @dev store the current state of the Camaign. 
    */
    enum State{NotStarted, Running, Funded, UnderFunded}
    
    
    /** @dev define the standard properties of a Campaign 
    * @notice the doners are a mapping of addresses to uints. This enables each
    * donar to donate more than one time and for a record to be kept. Moreover,
    * if a doner removes their donation, a negative value can be stored here to
    * indicate the withdrawl
    * @notice the donersAddresses is used to store an array of all donars that
    * contributed as maps are not itterable by populated keys
    */
    struct Campaign {
        address manager;
        uint startingTime;
        uint endingTime;
        uint balance;
        uint goal;
        uint cap;
        State state;
        mapping(address=>int[]) doners;
        address[] donersAddresses;
        string ipfsHash;
    }
    
    /** @dev store the total number of campaigns. Useful for retreving all of them **/
    uint public campaignCount;
    
    /**
    * @dev Stop the creation of new campagins
    */
    bool public emergencyStop_stopCreation = false;
    
    /**
    * @dev stops the fundion of existing campagins
    */
    bool public emergencyStop_stopFunding = false;
    
    /** @dev store all campaigns as a mapping to their unique ID **/
    mapping(uint=>Campaign) public campaigns;
    
    /**
    * @dev Verify the times spesified for the campaign are valid
    * @param _startingTime of the campaign (unix time stamp)
    * @param _endingTime of the campaign (unix time stamp)
    */
    modifier validNewCampaignTime(uint _startingTime,uint _endingTime){
        require(_startingTime>=now);
        require(_endingTime>_startingTime);
        _;
    }
    
    /**
    * @dev Verify the goals and cap for the campaign are valid
    * @notice if the cap is set to zero, it is uncapped
    * @param _goal value of the campaign (in ETH)
    * @param _cap value of the campaign (in ETH)
    */
    modifier validNewCampaignFunding(uint _goal,uint _cap) {
        if(_cap !=0){
            require(_cap>_goal);
        }
        _;
    }
    
    /**
    * @dev Verify the current time is past the start time of the camaign
    * @param _campaignID unique identifer of the campaign
    */
    modifier campaignHasStarted(uint _campaignID) {
        require(now>campaigns[_campaignID].startingTime);
        _;
    }
    
    /**
    * @dev checks if the campaign is yet to start
    * @param _campaignID unique identifer of the campaign
    */
    modifier campaignNotStarted(uint _campaignID){
        require(now < campaigns[_campaignID].startingTime);
        _;
    }

    /**
    * @dev checks if the campain has ended (current time more than end time)
    * @param _campaignID unique identifer of the campaign
    */
    modifier campaignEnded(uint _campaignID){
        require(now>campaigns[_campaignID].endingTime);
        _;
    }

    /**
    * @dev Verify the current time is not past the end time of the camaign
    * @param _campaignID unique identifer of the campaign
    */
    modifier campaignHasNotEnded(uint _campaignID) {
        require(now<campaigns[_campaignID].endingTime);
        _;
    }
    

    

    
    /**
    * @dev checks if the campain has Succeeded (donation > than goal)
    * @param _campaignID unique identifer of the campaign
    */
    modifier campaignSucceeded(uint _campaignID){
        require(campaigns[_campaignID].balance>campaigns[_campaignID].goal);
        _;
    }

    /**
    * @dev checks if the campain has failed (donation < than goal)
    * @param _campaignID unique identifer of the campaign
    */
    modifier campaignUnsuccessful(uint _campaignID) {
        require(now > campaigns[_campaignID].endingTime);
        require(campaigns[_campaignID].balance > campaigns[_campaignID].goal);
        _;
    }

    /**
    * @dev checks if a campain has been funded, and therefore paid out. 
    * @notice This assertion prevents manager's from withdrawing twice from a fund.
    * @param _campaignID unique identifer of the campaign
    */
    modifier campaignNotFunded(uint _campaignID){
        require(campaigns[_campaignID].state != State.Funded);
        _;
    }
    
    /**
    * @dev Verify that the donation will not cause the campaign to exceed its cap
    * @notice this function takes into account the current balance and the donation
    * @param _campaignID unique identifer of the campaign
    */
    modifier campaignWillNotExceedCap(uint _campaignID) {
        require(campaigns[_campaignID].balance + msg.value<=campaigns[_campaignID].cap);
        _;
    }
    
    /**
    * @dev Verify that the donation will not cause the campaign to drop below
    * its goal. This prevents someone from making a campaign that would succeed,
    * fail due to cancelling their contribution
    * @notice value is required as the user has the choice to either cancle or
    * reduce their donation.
    * @param _campaignID unique identifer of the campaign
    * @param _value is the amount that the donar wants to reduce their donation by
    */
    modifier campaignWillNotDropBelowGoal(uint _campaignID, uint _value) {
        if(campaigns[_campaignID].balance>campaigns[_campaignID].goal){
            require(campaigns[_campaignID].balance-_value > campaigns[_campaignID].goal);
        }
        _;
    }
    
    /**
    * @dev Verify that the reduction from a donation will not cause the donation
    * to drop below zero, and as such enabling the user to take out more than
    * they deposited. Moreover, this check ensures that a user who did not donate
    * cant withdraw as this assert will fail as their total donation balance will
    * be zero.
    * @notice the function needs to check the total donation for the user by
    * summing over all previous donations
    * @param _campaignID unique identifer of the campaign
    * @param _value is the amount that the donar wants to reduce their donation by
    */
    modifier adequetDonationToReduce(uint _campaignID, uint _value){
        int totalDonation = 0;
        for (uint i=0; i<campaigns[_campaignID].doners[msg.sender].length;i++){
            totalDonation += campaigns[_campaignID].doners[msg.sender][i];
        }
        require(totalDonation-int(_value)>=0);
        _;
    }
    
    /**
    * @dev checks that the caller of the function is the campaign's manager;
    * This is the person that create the campaign.
    * @param _campaignID unique identifer of the campaign
    */
    modifier onlyManager(uint _campaignID){
        require(msg.sender == campaigns[_campaignID].manager);
        _;
    }
    /**
    * @dev checks if a caller of the function is a Contributer to the campaign
    * @notice If they have contributed, there will be some items within the 
    * doners array representing donations.
    * @param _campaignID unique identifer of the campaign
    */
    modifier onlyContributer(uint _campaignID){
        require(campaigns[_campaignID].doners[msg.sender].length > 0);
        _;
    }
    
    /**
    * @dev Prevents the creation of new campaigns
    */
    modifier emergencyStop_Creation(){
        assert(!emergencyStop_stopCreation);
        _;
    }
    
    /**
    * @dev Prevents the funding of new campaigns
    */
    modifier emergencyStop_Funding(){
        assert(!emergencyStop_stopFunding);
        _;
    }
    
     /** @dev Assign owner and reset campaign */
    constructor() 
        public {
        owner = msg.sender;
        campaignCount = 0;
    }
    
    function enableEmergencyStop_Creation()
        public
        onlyOwner
    {
        emergencyStop_stopCreation = true;
    }
    
    function enableEmergencyStop_Funding()
        public
        onlyOwner
    {
        emergencyStop_stopFunding = true;
    }
    
    /**
    * @dev Generate a new campaign struct and store it. Assign manager and values
    * @notice this sets the inital value of the State to NotStarted
    * @param _startingTime unix time stamp of when the campaign will start
    * @param _endingTime unix time stamp of when the campaign will end
    * @param _goal value of the campaign (in ETH).
    * @param _cap value of the campaign (in ETH)
    * @param _ipfsHash represents the campain information on IPFS in a hash
    */
    function createCampaign(
        uint _startingTime, 
        uint _endingTime, 
        uint _goal, 
        uint _cap, 
        string _ipfsHash
    ) 
        public
        validNewCampaignTime(_startingTime,_endingTime)
        validNewCampaignFunding(_goal,_cap)
        emergencyStop_Creation
        returns(uint)
    {
        address[] memory emptydonersAddresses;
        campaigns[campaignCount] = Campaign({
            manager: msg.sender,
            startingTime: _startingTime,
            endingTime: _endingTime,
            balance: 0,
            goal: _goal,
            cap: _cap,
            state: State.NotStarted,
            donersAddresses: emptydonersAddresses,
            ipfsHash: _ipfsHash
        });
        campaignCount += 1;
        return campaignCount;
    }
    
    /**
    * @dev Enable anyone to donate to a campaign. The campaign must have started,
    * have not finished and not exceeded it's cap to be able to deposit.
    * @notice this changes the state of a campaign from NotStarted -> Running
    * @param _campaignID unique identifer of the campaign
    */
    function fundCampaign(uint _campaignID) 
        public
        payable
        campaignHasStarted(_campaignID)
        campaignHasNotEnded(_campaignID)
        campaignWillNotExceedCap(_campaignID)
        emergencyStop_Funding
    {
        campaigns[_campaignID].balance += msg.value;
        // Need to implicity typecast the msg.value for as donars can be
        // negative when withdrawing
        campaigns[_campaignID].doners[msg.sender].push(int(msg.value));
        // There is no point in storing a doners address multiple times in the
        //donersAddresses array so only add if you this is your first contribution
        // if(campaigns[_campaignID].doners[msg.sender].length==0){
            campaigns[_campaignID].donersAddresses.push(msg.sender);         
        // }
        if (campaigns[_campaignID].state != State.Running){
            campaigns[_campaignID].state = State.Running;
        }
    }
    
    /**
    * @dev Enable any donar to reduce their donation. The campaign must have,
    * started have not finished and their reduction must not make a project that
    * would succeed fail due to the reduction.
    * @notice we dont need to check the state of the campain as you would only
    * call this function if you had at some point donated and the check is done 
    * there (function fundCampaign).
    * @param _campaignID unique identifer of the campaign
    * @param _value the amount bywhich the campaign is reduced
    */
    function reduceDontation(uint _campaignID, uint _value)
        public
        campaignHasStarted(_campaignID)
        campaignHasNotEnded(_campaignID)
        campaignWillNotDropBelowGoal(_campaignID, _value)
        adequetDonationToReduce(_campaignID, _value)
    {
        campaigns[_campaignID].balance -= _value;
        // store the reduction in the doners respective array as a negative value
        // preserving a history of reductions. The sum of this array is their
        // respective donation
        campaigns[_campaignID].doners[msg.sender].push(-int(_value));
        msg.sender.transfer(_value); //refund the user for the Ether they sent in
    }
    
    /**
    * @dev Enable the campaign manager to withdraw the funds donated after the 
    * period is finished. The state of the campaign.state defines if the ownerc
    * @notice The campaign state changes from Running -> Funded
    * @param _campaignID unique identifer of the campaign
    */
    function withdrawCampaignFunds(uint _campaignID)
        public
        onlyManager(_campaignID)
        campaignEnded(_campaignID)
        campaignSucceeded(_campaignID)
        campaignNotFunded(_campaignID)
    {
        // Note that we dont have to change the balance of the campaign as we
        // prevent double withdraws by checking the state of the campaign. 
        // Leaving the balance within the campaign enables an easy way to sender
        // the total funds sent to the campaign.
        campaigns[_campaignID].state = State.Funded;
        msg.sender.transfer(campaigns[_campaignID].balance);
    }
    
    /**
    * @dev Enables someone who contributed to a failed campaign to get back 
    * their contributions back. This is a sum of all their contributions
    * period is finished. 
    * @notice The campaign state changes from Running -> Failed
    * @param _campaignID unique identifer of the campaign
    */
    function refundFailedCampaign(uint _campaignID)
        public
        onlyContributer(_campaignID)
        campaignEnded(_campaignID)
        campaignUnsuccessful(_campaignID)
    {
        uint totalContributed = 0;
        for (uint i = 0;i < campaigns[_campaignID].doners[msg.sender].length; i++){
            totalContributed += uint(campaigns[_campaignID].doners[msg.sender][i]);
        }
        // Take away their whole contribution from their profile. This means
        // that if they try redraw again the sum total == 0
        campaigns[_campaignID].doners[msg.sender].push(-int(totalContributed));
        msg.sender.transfer(totalContributed);
    }

    /**
    * @dev Enables a fund manager to update the ipfs hash on an entry in the 
    * case they change it. 
    * @notice They can ONLY do this before a fund is sstarted.
    * @param _campaignID unique identifer of the campaign
    * @param _newHash defines the new IPFS hash for the campaign
    */
    function updateIpfsHash(uint _campaignID, string _newHash)
        public
        onlyManager(_campaignID)
        campaignNotStarted(_campaignID)
    {
        campaigns[_campaignID].ipfsHash = _newHash;
    }
    
    function fetchCampaign(uint _campaignID)
        public
        view
        returns
        (address manager,
        uint startingTime,
        uint endingTime,
        uint balance,
        uint goal,
        uint cap,
        State state,
        address[] donersAddresses,
        string ipfsHash)
    {
        manager = campaigns[_campaignID].manager;
        startingTime = campaigns[_campaignID].startingTime;
        endingTime = campaigns[_campaignID].endingTime;
        balance = campaigns[_campaignID].balance;
        goal = campaigns[_campaignID].goal;
        cap = campaigns[_campaignID].cap;
        state = campaigns[_campaignID].state;
        donersAddresses = campaigns[_campaignID].donersAddresses;
        ipfsHash = campaigns[_campaignID].ipfsHash;
        return (manager, startingTime, endingTime, balance, goal, cap, state, donersAddresses, ipfsHash);
    }
}