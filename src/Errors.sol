// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

library Errors {
    error AmountTooLow(uint256 available, uint256 required);
    error CannotJoinGame(bool alreadHasP2, bool tryingToJoinOwnGame);
    error InvalidBalance(uint256 balance);
    error IndexOutOfBounds(uint256 gameId);
    error InvalidPassword();
    error NoActiveTimer();
    error NoSecondPlayer();
    error NotEnoughMoneyInContract(uint256 available, uint256 requested);
    error NotSecondPlayer(address expected, address received);
    error PlayerBalanceNotEnough(uint256 available, uint256 required);
    error TimerFinished();
    error TimerStillRunning();
    error AlreadyRevealed(address player, uint256 gameId);
    error NotResolvable(bool timerStillRunning, bool p1Revealed, bool p2Revealed);
}
