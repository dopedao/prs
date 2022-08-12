// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";
import { Counters } from "@openzeppelin/contracts/utils/Counters.sol";
import { Errors } from "./Errors.sol";
import { TaxableGame } from "./TaxableGame.sol";

//                                       .::^^^^::..
//                              .:^!?YPG##&&$$$$$&&#BP5J7~:
//                          .!PB#&$$$$$$$$$$$$$$$$$$$$$$$$&BPJ!:
//                       .!5#$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$&BY^
//                    .!5&$$$$$$$$$$$$$$$$$#BB##&$$$$$$$$$$$$$$$$$$P^
//                  ~5#$$$$$$$$$$$$#G5YJ?!^.  ...:^!?5G#$$$$$$$$$$$$$Y:
//                !G$$$$$$$$$$$#57^.                   .~?G&$$$$$$$$$$&J.
//              ^G$$$$$$$$$$&P!.                           :?B$$$$$$$$$$#!
//             J$$$$$$$$$$#J:                                 !B$$$$$$$$$$5.
//           .P$$$$$$$$$#?.                                     ?&$$$$$$$$$G.
//          :G$$$$$$$$&?.              .                         :G$$$$$$$$$Y
//         ~#$$$$$$$$5:             .Y##Y.                         5$$$$$$$$&:
//        Y$$$$$$$$$?              :#$$$$?      .?YJ^               P$$$$$$$$5
//       ~$$$$$$$$$?               Y$$$$$Y     ^B$$$$!              .#$$$$$$$$^
//       P$$$$$$$$?     ~!^.       P$$$$$?     B$$$$$7               J$$$$$$$$J
//      7$$$$$$$$5     ^$$$#BB##Y  !$$$$G      B$$$$G                ^$$$$$$$$J
//     ^$$$$$$$$&.      J$$$$$$&Y   7GGY.      Y$$$G.                :&$$$$$$$!
//     Y$$$$$$$$G        7$$$$?.               .JP?    !J!~!??^      ^$$$$$$$$^
//     7$$$$$$$$#.       :$$$$^                       ?$$$$$$$$~     ?$$$$$$$$^
//     :&$$$$$$$$~        G$$$#:                      .5$$$$$#Y:     B$$$$$$$&:
//     .#$$$$$$$$7        ^&$$$#^                     .B$$$$J.      7$$$$$$$$?
//      5$$$$$$$#.         ^#$$$&7                   .G$$$$!       :#$$$$$$$J
//      !$$$$$$$#^          :P$$$$P~               .?#$$$$!        G$$$$$$$Y
//      .#$$$$$$$&!           !B$$$$BJ~:      .:~?P&$$$$G~       .P$$$$$$$P
//       Y$$$$$$$$$7            !P&$$$$&#GPPPG#&$$$$$$P~        :G$$$$$$$B.
//       :&$$$$$$$$$?             :!YG&$$$$$$$$$$$&GJ^         ?&$$$$$$$#:
//        7$$$$$$$$$$Y.               .^~7??7!~!!~:         .7B$$$$$$$$G:
//         ~B$$$$$$$$$B!                                  ^J#$$$$$$$$&J
//           J$$$$$$$$$$BJ~.                           ^JB$$$$$$$$$$P^
//            ^G$$$$$$$$$$$#P?^.                   :!YB$$$$$$$$$$$#!
//              ?&$$$$$$$$$$$$$#G5?!^:.  .:~7??J5P#&$$$$$$$$$$$&G?.
//               .J#$$$$$$$$$$$$$$$$$&#BB#&$$$$$$$$$$$$$$$$$$G7.
//                 .7P#$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$&G?^
//                    .^7J5G#$$$$$$$$$$$$$$$$$$$$$$$$&B57:
//                          .^7YPB#&&&$$$&&&&##BG5J7~:
//                                ..::::::::...
//
// @author DOPE DAO
// @notice This contract is NOT SECURITY AUDITED. Use at your own risk.
contract PRS is Ownable, Pausable, TaxableGame {
    // @notice Both players have 12 hours to reveal their move
    // if one of them fails to do so the other can take the pot
    uint256 public revealTimeout = 12 hours;
    using Counters for Counters.Counter;
    Counters.Counter private _games;

    enum Choices {
        NONE,
        ROCK,
        PAPER,
        SCISSORS,
        INVALID
    }

    struct Game {
        bytes32 p1SaltedChoice;
        bytes32 p2SaltedChoice;

        Choices p1ClearChoice;
        Choices p2ClearChoice;

        address p1;
        address p2;

        uint256 entryFee;
        uint256 timerStart;

        bool resolved;
    }

    mapping(uint256 => Game) Games;

    event CreatedGame(address indexed, uint256, uint256);
    event JoinedGameOf(address indexed, address indexed, uint256, uint256, uint256);
    event WonGameAgainst(address indexed, Choices, address indexed, Choices, uint256, uint256);
    event GameDraw(address indexed, Choices, address indexed, Choices, uint256, uint256);

    function setRevealTimeout(uint256 newTimeout) public onlyOwner {
        revealTimeout = newTimeout;
    }

    // @notice Returns a single game for Player 1
    // @return Game struct 
    function getGame(uint256 gameId) public view returns (Game memory) {
        Game storage game = Games[gameId];
        if (game.p1 == address(0)) revert Errors.IndexOutOfBounds(gameId);

        return game;
    }

    // @notice Return time left after Player 2 has revealed their move.
    function getTimeLeft(uint256 gameId) public view returns (uint256) {
        Game memory game = getGame(gameId);
        if (_didTimerRunOut(game.timerStart)) revert Errors.TimerFinished();
        if (game.p2 == address(0)) revert Errors.NoActiveTimer();
        return revealTimeout - (block.timestamp - game.timerStart);
    }

    // @notice Return entry fee for a game being played.
    function getGameEntryFee(uint256 gameId) public view returns (uint256) {
        Game memory game = getGame(gameId);
        return game.entryFee;
    }

    // @notice Pause game incase of suspicious activity
    function pauseGame() public onlyOwner {
        _pause();
    }

    // @notice Unpause game
    function unpauseGame() public onlyOwner {
        _unpause();
    }

    /* ========================================================================================= */
    // Commit
    /* ========================================================================================= */

    // @notice Whoever calls this makes a new game and becomes "p1"
    //         Player can make multiple games at a time.
    function startGame(bytes32 encChoice, uint256 entryFee)
        public
        checkEntryFeeEnough(entryFee)
        checkAddressHasSufficientBalance(entryFee)
        whenNotPaused
    {
        Game storage game = Games[_games.current()];
        _games.increment();

        game.p1 = msg.sender;
        game.entryFee = entryFee;
        game.p1SaltedChoice = encChoice;

        _subtractFromBalance(msg.sender, entryFee);
        emit CreatedGame(msg.sender, entryFee, block.timestamp);
    }

    // @notice Allows p2 to join an existing game by gameId
    function joinGame(
        uint256 gameId,
        bytes32 p2SaltedChoice,
        uint256 entryFee
    )
    public
    checkAddressHasSufficientBalance(entryFee)
    whenNotPaused
    {
        Game storage game = Games[gameId];
        address player1 = game.p1;

        if (player1 == address(0)) revert Errors.IndexOutOfBounds(gameId);
        if (player1 == msg.sender) revert Errors.CannotJoinGame(false, true);
        if (game.p2 != address(0)) revert Errors.CannotJoinGame(true, false);
        if (entryFee < game.entryFee) revert Errors.AmountTooLow(entryFee, game.entryFee);

        game.p2 = msg.sender;
        game.p2SaltedChoice = p2SaltedChoice;
        game.timerStart = block.timestamp;

        _subtractFromBalance(msg.sender, entryFee);
        emit JoinedGameOf(msg.sender, player1, gameId, entryFee, block.timestamp);
    }

    /* ========================================================================================= */
    // Reveal / Resolve
    /* ========================================================================================= */

    function revealChoice(uint256 gameId, string calldata movePw) 
    public 
    whenNotPaused
    {
        Game storage game = Games[gameId];
        address player1 = game.p1;
        address player2 = game.p2;

        if (player1 == address(0)) revert Errors.IndexOutOfBounds(gameId);
        if (player2 == address(0)) revert Errors.NoSecondPlayer();

        if (msg.sender == player1) {
            if (game.p1ClearChoice != Choices.NONE) revert Errors.AlreadyRevealed(msg.sender, gameId);
            game.p1ClearChoice = _getHashChoice(game.p1SaltedChoice, movePw);
            return;
        }

        if (msg.sender == player2) {
            if (game.p2ClearChoice != Choices.NONE) revert Errors.AlreadyRevealed(msg.sender, gameId);
            game.p2ClearChoice = _getHashChoice(game.p2SaltedChoice, movePw);
            return;
        }
    }

    function resolveGame(uint256 gameId) 
    public
    whenNotPaused
    {
        Game storage game = Games[gameId];
        if (game.p1 == address(0)) revert Errors.IndexOutOfBounds(gameId);
        if (game.p2 == address(0)) revert Errors.NoSecondPlayer();
        if (game.resolved) revert Errors.NotResolvable(false, false, false, true);

        bool isTimerRunning = !_didTimerRunOut(game.timerStart);
        bool isP1ChoiceNone = game.p1ClearChoice == Choices.NONE;
        bool isP2ChoiceNone = game.p2ClearChoice == Choices.NONE;

        // @notice Game is not resolvable if timer is still running and both players 
        //         have not revealed their move
        if (isTimerRunning && (isP2ChoiceNone || isP1ChoiceNone)) revert Errors.NotResolvable(isTimerRunning, isP1ChoiceNone, isP2ChoiceNone, false);
        uint256 gameBalance = game.entryFee * 2;

        // @notice Set to false before we payout
        // no re-entrancy
        game.resolved = true;

        // @notice If we are here that means both players revealed their move.
        //         If both revealed their move in time we can choose a winner.
        if (isTimerRunning) {
            _chooseWinner(game.p1ClearChoice, game.p2ClearChoice, game.p1, game.p2, entryFee);
            return;
        }

        // @notice Timer ran out and only p2 did not reveal
        if (!isTimerRunning && !isP1ChoiceNone && isP2ChoiceNone) {
            _payout(p1, gameBalance);
            return;
        }

        // @notice Timer ran out and only p1 did not reveal
        if (!isTimerRunning && isP1ChoiceNone && !isP2ChoiceNone) {
            _payout(game.p2, gameBalance);
            return;
        }
        // @notice If both players fail to reveal the entryFee gets "burned" ;)
    }

    /* ========================================================================================= */
    // Choosing a winner
    /* ========================================================================================= */

    // @notice How PRS chooses a winner when two choices are revealed.
    //         Essential that you ZERO OUT ANY GAME BALANCES before calling this.
    function _chooseWinner(
        Choices p1Choice,
        Choices p2Choice,
        address p1,
        address p2,
        uint256 gameBalance
    ) internal {
        if (p1Choice == p2Choice) {
            _payout(p1, gameBalance / 2);
            _payout(p2, gameBalance / 2);
            emit GameDraw(p1, p1Choice, p2, p2Choice, gameBalance, block.timestamp);
            return;
        }

        if (
            (p1Choice == Choices.PAPER && p2Choice == Choices.ROCK) ||
            (p1Choice == Choices.ROCK && p2Choice == Choices.SCISSORS) ||
            (p1Choice == Choices.SCISSORS && p2Choice == Choices.PAPER)
        ) {
            _payout(p1, gameBalance);
            emit WonGameAgainst(p1, p1Choice, p2, p2Choice, gameBalance, block.timestamp);
            return;
        }

        if (p1Choice == Choices.INVALID) {
            _payout(p2, gameBalance);
            emit WonGameAgainst(p2, p2Choice, p1, p1Choice, gameBalance, block.timestamp);
            return;
        }

        if (p2Choice == Choices.INVALID) {
            _payout(p1, gameBalance);
            emit WonGameAgainst(p1, p1Choice, p2, p2Choice, gameBalance, block.timestamp);
            return;
        }

        _payout(p2, gameBalance);
        emit WonGameAgainst(p2, p2Choice, p1, p1Choice, gameBalance, block.timestamp);
    }

    function _didTimerRunOut(uint256 timerStart) internal view returns (bool) {
        return block.timestamp > timerStart + revealTimeout;
    }

    function _getHashChoice(bytes32 hashChoice, string calldata clearChoice)
        internal
        pure
        returns (Choices)
    {
        bytes32 hashedClearChoice = sha256(abi.encodePacked(clearChoice));
        if (hashChoice != hashedClearChoice) revert Errors.InvalidPassword();

        bytes1 first = bytes(clearChoice)[0];

        if (first == 0x31) {
            return Choices.ROCK;
        } else if (first == 0x32) {
            return Choices.PAPER;
        } else if (first == 0x33) {
            return Choices.SCISSORS;
        }

        return Choices.INVALID;
    }
}
