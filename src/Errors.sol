// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

library Errors {
    string constant IndexOutOfBounds = 'ioob';
    string constant CannotRemoveGame = 'crg';
    string constant AmountTooLow = 'atl';
    string constant CannotJoinGame = 'cjg';
    string constant NoSecondPlayer = 'nsp';
    string constant TimerStillRunning = 'tsr';
    string constant NotEnoughMoneyInContract = 'nemic';
    string constant InvalidPassword = 'ip';
    string constant TimerFinished = 'tf';
    string constant NoActiveTimer = 'nat';
}
