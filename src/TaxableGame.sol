// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// @notice Abstract contract to handle fees, taxes, balances, and payouts of players
abstract contract TaxableGame is Ownable, ReentrancyGuard {
    uint256 public MIN_ENTRY_FEE = 10000000 gwei; // 0.01 eth
    uint256 public TAX_PERCENT = 5;

    mapping(address => uint256) internal _balances;

    receive() external payable {
        // This should be implemented as our generic receive
        // TODO add balances in memory
    }
    function withdraw() public payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function setMinEntryFee(uint256 minEntryFee) public onlyOwner {
        MIN_ENTRY_FEE = minEntryFee;
    }

    function setTaxPercent(uint256 taxPercent) public onlyOwner {
        TAX_PERCENT = taxPercent;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function setBalance(address account, uint256 balance) internal {
        require(balance >= 0, "Balance can't be negative");
        _balances[account] = balance;
    }
}
