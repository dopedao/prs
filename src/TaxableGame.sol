// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

import { Errors } from "./PRSLibrary.sol";

// @notice Abstract contract to handle fees, taxes, balances, and payouts of players
abstract contract TaxableGame is Ownable, ReentrancyGuard, Pausable {
    // @notice Variable minimum entry fee in gwei
    uint256 public minEntryFee = 10000000 gwei; // 0.01 eth
    // @notice Tax percent the game takes for each round of play
    uint256 public taxPercent = 5;
    // @notice Address of $Paper contract
    address paperAddress = 0x00F932F0FE257456b32dedA4758922E56A4F4b42;

    // @notice Where we keep balances of players and the contract itself
    mapping(address => uint256) internal _balances;

    event PaidOut(address indexed, uint256, uint256);

    // @notice Check to determine if this address has enough balance to participate
    modifier checkAddressHasSufficientBalance(uint256 entryFee) {
        uint256 balance = balanceOf(msg.sender);
        if (balance < entryFee) revert Errors.PlayerBalanceNotEnough(balance, entryFee);
        _;
    }

    modifier checkEntryFeeEnough(uint256 entryFee) {
        if (entryFee < minEntryFee) revert Errors.AmountTooLow(entryFee, minEntryFee);
        _;
    }

    function changePaperContract(address paper) public onlyOwner {
        paperAddress = paper;
    }

    /* ========================================================================================= */
    // Receiving and withdrawing
    /* ========================================================================================= */

    // @notice Players increase their balance by sending the contract tokens
    receive() external payable {}

    // @notice Players can deposit $Paper to the contract
    // make sure to approve our contract to transfer first
    function depositPaper(uint256 amount) public whenNotPaused {
        // @notice Wrapper to execute erc20 functions
        require(IERC20(paperAddress).transferFrom(msg.sender, address(this), amount), "Transaction failed");
        _balances[msg.sender] += amount;
    }

    // @notice Players can withdraw their balance from the contract
    function withdraw(uint256 amount) public whenNotPaused {
        uint256 balance = balanceOf(msg.sender);
        if (_getContractBal() < balance) revert Errors.NotEnoughMoneyInContract(address(this).balance, balance);
        _setBalance(msg.sender, 0);
        
        _transferPaperTo(msg.sender, amount);
    }

    // @notice Withdraws tax from games played to contract owner
    function withdrawTax() public onlyOwner {
        uint256 balance = balanceOf(address(this));
        if (_getContractBal() < balance) revert Errors.NotEnoughMoneyInContract(address(this).balance, balance);
        _setBalance(address(this), 0);

        _transferPaperTo(msg.sender, balance);
    }

    /* ========================================================================================= */
    // Fees and taxes
    /* ========================================================================================= */
    function setMinEntryFee(uint256 fee) public onlyOwner {
        minEntryFee = fee;
    }

    function setTaxPercent(uint256 pct) public onlyOwner {
        taxPercent = pct;
    }

    /* ========================================================================================= */
    // Balances
    /* ========================================================================================= */

    // @notice Eth balance of contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // @notice Paper balance for players and this contract itself
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function _addToBalance(address account, uint256 amount) internal {
        uint256 currentBalance = balanceOf(account);
        uint256 newBalance = currentBalance + amount;
        _setBalance(account, newBalance);
    }

    function _subtractFromBalance(address account, uint256 amount) internal {
        uint256 currentBalance = balanceOf(account);
        uint256 newBalance = currentBalance - amount;
        if (0 >= newBalance) {
            newBalance = 0;
        }
        _setBalance(account, newBalance);
    }

    function _setBalance(address account, uint256 balance) internal {
        if (balance < 0) revert Errors.InvalidBalance(balance);
        _balances[account] = balance;
    }

    /* ========================================================================================= */
    // Payments
    /* ========================================================================================= */
    
    // @return payout Amount paid to player less tax
    // @return tax    Amount taxed from payout
    function _getPayoutWithTax(uint256 amount) internal view returns (uint256, uint256) {
        uint256 tax = (amount / 100) * taxPercent;
        uint256 payout = amount - tax;
        return (payout, tax);
    }

    // @notice A simple, and slightly UNSAFE payout function.
    //         Ensure that you're setting balances to zero wherever this is called.
    function _payout(address player, uint256 amount) internal {
        (uint256 payout, uint256 tax) = _getPayoutWithTax(amount);

        _addToBalance(address(this), tax);
        _addToBalance(player, payout);

    }

    // @notice Transfer $Paper from contract to receiver
    function _transferPaperTo(address receiver, uint256 amount) internal {
        require(IERC20(paperAddress).transfer(receiver, amount), "Transaction failed");
        emit PaidOut(receiver, amount, block.timestamp);
    }

    // @notice Get $Paper balance of contract
    function _getContractBal() internal view returns (uint256) {
        return IERC20(paperAddress).balanceOf(address(this));
    }
}
