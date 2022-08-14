// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import { Choices, Errors, Game } from "../PRSLibrary.sol";
import { PaperRockScissors } from "../PaperRockScissors.sol";

/// @dev Mock contract for testing purposes.
///      Allows us to expose private methods for testing, and stub external calls
///      that would otherwise mess up our tests.
contract PRSMock is PaperRockScissors {
    constructor(address tablelandRegistry) PaperRockScissors(tablelandRegistry) {}
    
    /* ========================================================================================= */
    // External Tableland calls
    /* ========================================================================================= */
    function _createTable(address tablelandRegistry) internal override {
        // no-op
    }
    function _insertTableRow(
        uint256 gameId,
        Game memory game,
        address winner
    ) internal override {
        // no-op
    }

    /* ========================================================================================= */
    // Private methods for testing
    /* ========================================================================================= */
    function unsafeChooseWinner(
        Choices p1Choice,
        Choices p2Choice,
        address p1,
        address p2,
        uint256 entryFee
    ) public returns (address) {
        return _chooseWinner(p1Choice, p2Choice, p1, p2, entryFee);
    }

    function unsafeDidTimerRunOut(uint256 timerStart) public view returns (bool) {
        return _didTimerRunOut(timerStart);
    }

    function unsafeGetHashChoice(bytes32 hashChoice, string calldata clearChoice)
        public
        pure
        returns (Choices)
    {
        return _getHashChoice(hashChoice, clearChoice);
    }
}
