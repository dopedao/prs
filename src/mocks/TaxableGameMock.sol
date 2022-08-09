// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import { TaxableGame } from "../TaxableGame.sol";

contract TaxableGameMock is TaxableGame {
    function unsafeSetBalance(address account, uint256 balance) public onlyOwner {
        _setBalance(account, balance);
    }

    function unsafePayout(address winner, uint256 entryFee) public onlyOwner {
        _payout(winner, entryFee);
    }
}
