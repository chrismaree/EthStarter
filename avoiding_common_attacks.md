# Security Tools / Common Attacks
EthStarter has been designed to sufficiently prevent common attack vectors. Additionally, The contracts were verified through the use of a number of Security analysis tools, linters and code coverage checkers, including `Mythril`, `Solium` and `Solidity-Coverage`. Practices were taken from a [paper](https://github.com/SoIidarity/smart-contract-development-best-practice-paper) I wrote for a university project earlier this year on smart contract development best practices. 


### Security Considerations in Design
The simplicity in design means that most normal attack vectors do not apply, such as Race condition, Transaction-Ordering Dependence (TOD) and Front Running. There are, however, four sections of the system design that could result in potential attack vectors. Each of these possible vulnerabilities is discussed as well as how EthStarter mitigates against them.

1. **Timestamp Dependence**
EthStarter uses the notion of "now" in its design. This can be manipulated by miners but is not a concern for the safety of the system as there are no potential vulnerabilities arising from a ~30 second variance in the start/end time of the campaign.
2. **Integer Overflow and Underflow**
The balances of each campaign is stored using a uint. These *could* potentially overflow/underflow. The case of an overflow is imposible as this value corisponds to ether deposited and there is not enough ether in circulation to cause an overflow. Underflows are prevented by sufficient checks within require statements. The correctness of these requires is verified with unit tests.
3. **Forcibly Sending Ether to a Contract**
It is conceivable that someone could forcibly send ether the the campaign. This will, however, achieve nothing past the attacker loosing their ether. There is no core logic based on this total value of the contract but rather each campaign has their own independent wallet uint.
4. **Reentrancy attacks**
The EthStarter contract is invulnerable to Reentrancy attacks due to correct ordering of operations in withdraw type statements and the use of transfer() to prevent any external code from being executed.

### Smart Contract Security Audit
Each Testing framework and their respective results will be discussed.


1. **Mythril**: Testing was preformed with mythril. The easiest way to interact with Mythril is via a docker container. To start, pull the docker container as follows:

        docker pull mythril/myth

Once you have the container on your local machine you can use it to execute tests on contracts by mounting the local working directory as a volume within the container. From the root of the project repo you can run:

    docker run -v $(pwd):/tmp -w "/tmp/" mythril/myth --truffle

Mythril reported a number of warnings regarding Timestamp dependencies, integer overflow/underflow and a number of other interesting results. None of which are system braking nor could be considered vulnerabilities due to having adequate checks to prevent against under/overflows.  

2. **Solium**: Linting to identify and fix styling and security issues within the smart contracts was preformed using Solium. To get running with Solium, first install it globally as using:
    
        npm install -g solium    
Next, we can lint the whole directory of contracts using:

        solium -d contracts/
Note that this assumes that you have set up a new solium project. If you are running this on your own project, first init the project to get started.

        solium --init

Solium showed 6 warnings in the `CampaignManager.sol` due to the use of `now`. This is unavoidable in the EthStarter implementation unless some other method is used to get the time and for the MVP this is acceptable. No other problems were found with this contract

Solium reported 1 error in the `Proxy.sol` due to the use of inline assembly. Despite this, it is considered secure as the proxy contract followed standard design patterns for creating a delegate proxy contract with battle tested assemble, adapted from openzeplin proxy contracts.


3. **Solidity-Coverage**: Extensive unit tests have been written for the key logic of the system. Code coverage has also been calculated and the results can be seen below. Both Contracts included in the project yield 100% test coverage.

    | File                   | % Stmts    | % Branch   | % Funcs    | % Lines    | Uncovered Lines  |
    | ---------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |
    | contracts/             | 100        | 79.17      | 100        | 100        |                  |
    | CampaignManager.sol    | 100        | 81.82      | 100        | 100        |                  |
    | Proxy.sol              | 100        | 50         | 100        | 100        |                  |
    | **All files**              | 100        | 79.17      | 100        | 100        |                  |


4. **Oyente** was also tested but the current version only supports solc up to version `0.4.19` but EthStarter has been implemented using `0.4.21` so no validation could be done easily.

