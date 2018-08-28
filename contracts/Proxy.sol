pragma solidity ^0.4.18;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Proxy is Ownable {

    event Upgraded(address indexed implementation);

    address internal _implementation;
    
    function implementation() public view returns (address) {
        return _implementation;
    }

    function upgradeTo(address impl) public onlyOwner {
        require(_implementation != impl, "upgrade address should not be the same as the current address");
        _implementation = impl;
        emit Upgraded(impl);
    }
    
    function () public payable {
        address _impl = implementation();
        require(_impl != address(0), "The implementation address should not be the burn address (non-implemented proxy contract)");
        bytes memory data = msg.data;

        assembly {
        let result := delegatecall(gas, _impl, add(data, 0x20), mload(data), 0, 0)
        let size := returndatasize
        let ptr := mload(0x40)
        returndatacopy(ptr, 0, size)
        switch result
        case 0 { revert(ptr, size) }
        default { return(ptr, size) }
        }
    }

}