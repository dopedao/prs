// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { PRS } from "../PRS.sol";

contract PRSMock is PRS {


    function unsafeChooseWinner(
        Choices p1Choice,
        Choices p2Choice,
        address p1,
        address p2,
        uint256 entryFee
    ) public {
        return _chooseWinner(p1Choice, p2Choice, p1, p2, entryFee);
    }

    function unsafeDidTimerRunOut(uint256 timerStart) public view returns (bool) {
        return _didTimerRunOut(timerStart);
    }

    function unsafeGetHashChoice(bytes32 hashChoice, string calldata clearChoice)
        public
        pure
        returns (Choices) {
        return _getHashChoice(hashChoice, clearChoice);
    }
}
