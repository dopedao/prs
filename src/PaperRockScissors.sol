// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Address.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";
import { Counters } from "@openzeppelin/contracts/utils/Counters.sol";

import { TaxableGame } from "./TaxableGame.sol";
import { PRSLeaderboard } from "./PRSLeaderboard.sol";
import { Choices, Errors, Game } from "./PRSLibrary.sol";

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

/// A competitive, token-based, on-chain game of skill that persists results
/// to a public leaderboard stored in tableland.
///
/// @title PAPER, ROCK, SCISSORS
/// @author DOPE DAO
contract PaperRockScissors is Ownable, Pausable, TaxableGame, PRSLeaderboard {
    /// Both players have 12 hours to reveal their move.
    /// If one of them fails to do so the other can take the pot.
    uint256 public revealTimeout = 12 hours;
    using Counters for Counters.Counter;
    Counters.Counter private _games;
    mapping(uint256 => Game) Games;

    event CreatedGame(address indexed, uint256, uint256);
    event JoinedGameOf(address indexed, address indexed, uint256, uint256, uint256);
    event WonGameAgainst(address indexed, Choices, address indexed, Choices, uint256, uint256);
    event GameDraw(address indexed, Choices, address indexed, Choices, uint256, uint256);

    /// Create tableland schema for our leaderboard.
    /// @param tablelandRegistry Address of the "tableland registry" on the chain this will be deployed on
    /// @dev Find the list of tableland registries here https://docs.tableland.xyz/limits-and-deployed-contracts#ae3cfc1cfd2941bfa401580aa1e05c5e
    constructor(address tablelandRegistry) {
        _createTable(tablelandRegistry);
    }

    function setRevealTimeout(uint256 newTimeout) public onlyOwner {
        revealTimeout = newTimeout;
    }

    /// @dev Get game by (internal) ID
    /// @return Game struct
    function getGame(uint256 gameId) public view returns (Game memory) {
        Game storage game = Games[gameId];
        if (game.p1 == address(0)) revert Errors.IndexOutOfBounds(gameId);

        return game;
    }

    /// Return time left for both players to reveal their move
    function getTimeLeft(uint256 gameId) public view returns (uint256) {
        Game memory game = getGame(gameId);
        if (_didTimerRunOut(game.timerStart)) revert Errors.TimerFinished();
        if (game.p2 == address(0)) revert Errors.NoActiveTimer();
        return revealTimeout - (block.timestamp - game.timerStart);
    }

    /// @return Entry fee for a game id. 1/2 the "pot"
    function getGameEntryFee(uint256 gameId) public view returns (uint256) {
        Game memory game = getGame(gameId);
        return game.entryFee;
    }

    function pauseGame() public onlyOwner {
        _pause();
    }

    function unpauseGame() public onlyOwner {
        _unpause();
    }

    /* ========================================================================================= */
    // Commit
    /* ========================================================================================= */

    /// Whoever calls this makes a new game and becomes "p1"
    /// Requires a sha256 encoded move and password to be stored as
    /// A player can make multiple games at a time.
    ///
    /// @param encChoice sha256 hashed move and password
    /// @param entryFee The amount of entry fee required for this game.
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

    /// Allows p2 to join an existing game by gameId
    /// Requires player to commit their hashed move and password to join.
    /// Will fail if player does not have high enough balance on contract.
    ///
    /// @param gameId ID of game stored in local storage.
    /// @param encChoice sha256 hashed move and password
    /// @param entryFee The amount of entry fee required for this game.
    function joinGame(
        uint256 gameId,
        bytes32 encChoice,
        uint256 entryFee
    ) public checkAddressHasSufficientBalance(entryFee) whenNotPaused {
        Game storage game = Games[gameId];
        address player1 = game.p1;

        if (player1 == address(0)) revert Errors.IndexOutOfBounds(gameId);
        if (player1 == msg.sender) revert Errors.CannotJoinGame(false, true);
        if (game.p2 != address(0)) revert Errors.CannotJoinGame(true, false);
        if (entryFee < game.entryFee) revert Errors.AmountTooLow(entryFee, game.entryFee);

        game.p2 = msg.sender;
        game.p2SaltedChoice = encChoice;
        game.timerStart = block.timestamp;

        _subtractFromBalance(msg.sender, entryFee);
        emit JoinedGameOf(msg.sender, player1, gameId, entryFee, block.timestamp);
    }

    /* ========================================================================================= */
    // Reveal
    /* ========================================================================================= */

    function revealChoice(uint256 gameId, string calldata movePw) public whenNotPaused {
        Game storage game = Games[gameId];
        address player1 = game.p1;
        address player2 = game.p2;

        if (player1 == address(0)) revert Errors.IndexOutOfBounds(gameId);
        if (player2 == address(0)) revert Errors.NoSecondPlayer();

        if (msg.sender == player1) {
            if (game.p1ClearChoice != Choices.NONE)
                revert Errors.AlreadyRevealed(msg.sender, gameId);
            game.p1ClearChoice = _getHashChoice(game.p1SaltedChoice, movePw);

            if (game.p2ClearChoice != Choices.NONE) {
                _resolveGame(gameId);
            }
            return;
        }

        if (msg.sender == player2) {
            if (game.p2ClearChoice != Choices.NONE)
                revert Errors.AlreadyRevealed(msg.sender, gameId);
            game.p2ClearChoice = _getHashChoice(game.p2SaltedChoice, movePw);
            if (game.p1ClearChoice != Choices.NONE) {
                _resolveGame(gameId);
            }
            return;
        }
    }

    /* ========================================================================================= */
    // Resolve
    /* ========================================================================================= */
    
    /// @dev Game is resolvable when this function gets called
    ///      and therefore we can omit the safety checks
    function _resolveGame(uint256 gameId) private whenNotPaused {
        Game storage game = Games[gameId];
        game.resolved = true;

        uint256 gameBalance = game.entryFee * 2;

        address winner = _chooseWinner(
            game.p1ClearChoice,
            game.p2ClearChoice,
            game.p1,
            game.p2,
            gameBalance
        );
        _insertTableRow(gameId, game, winner);
        return;
    }

    /// @dev Game is not resolvable if timer is still running and both players
    ///      have not revealed their move.
    function resolveGame(uint256 gameId) public whenNotPaused {
        Game storage game = Games[gameId];
        if (game.p1 == address(0)) revert Errors.IndexOutOfBounds(gameId);
        if (game.p2 == address(0)) revert Errors.NoSecondPlayer();
        if (game.resolved) revert Errors.NotResolvable(false, false, false, true);

        bool isTimerRunning = !_didTimerRunOut(game.timerStart);
        bool isP1ChoiceNone = game.p1ClearChoice == Choices.NONE;
        bool isP2ChoiceNone = game.p2ClearChoice == Choices.NONE;

        if (isTimerRunning && (isP2ChoiceNone || isP1ChoiceNone))
            revert Errors.NotResolvable(isTimerRunning, isP1ChoiceNone, isP2ChoiceNone, false);
        uint256 gameBalance = game.entryFee * 2;

        /// Prevent re-entrancy.
        game.resolved = true;

        // If we are here that means both players revealed their move.
        // If both revealed their move in time we can choose a winner.
        if (isTimerRunning) {
            address winner = _chooseWinner(
                game.p1ClearChoice,
                game.p2ClearChoice,
                game.p1,
                game.p2,
                gameBalance
            );
            _insertTableRow(gameId, game, winner);
            return;
        }

        // Timer ran out and only p2 did not reveal
        if (!isTimerRunning && !isP1ChoiceNone && isP2ChoiceNone) {
            _payout(game.p1, gameBalance);
            _insertTableRow(gameId, game, game.p1);
            return;
        }

        // Timer ran out and only p1 did not reveal
        if (!isTimerRunning && isP1ChoiceNone && !isP2ChoiceNone) {
            _payout(game.p2, gameBalance);
            _insertTableRow(gameId, game, game.p2);
            return;
        }
        // If both players fail to reveal the entryFee gets "burned" ;)
    }

    /* ========================================================================================= */
    // Internals
    /* ========================================================================================= */

    /// How PRS chooses a winner when two choices are revealed.
    /// @dev Essential that you ZERO OUT ANY GAME BALANCES before calling this.
    function _chooseWinner(
        Choices p1Choice,
        Choices p2Choice,
        address p1,
        address p2,
        uint256 gameBalance
    ) internal returns (address) {
        if (p1Choice == p2Choice) {
            _payout(p1, gameBalance / 2);
            _payout(p2, gameBalance / 2);
            emit GameDraw(p1, p1Choice, p2, p2Choice, gameBalance, block.timestamp);
            return address(0);
        }

        if (
            (p1Choice == Choices.PAPER && p2Choice == Choices.ROCK) ||
            (p1Choice == Choices.ROCK && p2Choice == Choices.SCISSORS) ||
            (p1Choice == Choices.SCISSORS && p2Choice == Choices.PAPER)
        ) {
            _payout(p1, gameBalance);
            emit WonGameAgainst(p1, p1Choice, p2, p2Choice, gameBalance, block.timestamp);
            return p1;
        }

        if (p1Choice == Choices.INVALID) {
            _payout(p2, gameBalance);
            emit WonGameAgainst(p2, p2Choice, p1, p1Choice, gameBalance, block.timestamp);
            return p2;
        }

        if (p2Choice == Choices.INVALID) {
            _payout(p1, gameBalance);
            emit WonGameAgainst(p1, p1Choice, p2, p2Choice, gameBalance, block.timestamp);
            return p1;
        }

        _payout(p2, gameBalance);
        emit WonGameAgainst(p2, p2Choice, p1, p1Choice, gameBalance, block.timestamp);
        return p2;
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
