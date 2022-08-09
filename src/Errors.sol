// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

library Errors {
    string constant AmountTooLow = "Amount too low";
    string constant CannotJoinGame = "Cannot join game";
    string constant CannotRemoveGame = "Cannot remove game";
    string constant IndexOutOfBounds = "Index out of bounds";
    string constant InvalidPassword = "Invalid password";
    string constant NoActiveTimer = "No active timer";
    string constant NoSecondPlayer = "No second player";
    string constant NotEnoughMoneyInContract = "Not enough money in Contract";
    string constant PlayerBalanceNotEnough = "Player balance not large enough";
    string constant TimerFinished = "Timer finished";
    string constant TimerStillRunning = "Timer still running";
}
