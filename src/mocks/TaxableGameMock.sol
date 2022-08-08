// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { TaxableGame } from "../TaxableGame.sol";

contract TaxableGameMock is TaxableGame {
    function unsafeSetBalance(address account, uint256 balance)
        public
        onlyOwner
    {
        setBalance(account, balance);
    }
}
