// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/security/Pausable.sol";
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
    // @notice Player 1 has to reveal their move by this time after Player 2 reveals theirs,
    //         or Player 2 can reveal and take the pot.
    uint32 public constant REVEAL_TIMEOUT = 12 hours;

    enum Choices {
        ROCK,
        PAPER,
        SCISSORS,
        FORFEIT
    }

    struct Game {
        bytes32 p1SaltedChoice;
        address p2;
        Choices p2Choice;
        uint256 entryFee;
        uint256 timerStart;
    }

    mapping(address => Game[]) Games;

    event CreatedGame(address indexed, uint256, uint256);
    event JoinedGameOf(address indexed, address indexed, uint256, uint256, uint256);
    event WonGameAgainst(address indexed, Choices, address indexed, Choices, uint256, uint256);
    event GameDraw(address indexed, Choices, address indexed, Choices, uint256, uint256);

    // @notice Returns a single game for Player 1
    // @return Game struct 
    function getGame(address player, uint256 gameId) public view returns (Game memory) {
        Game[] storage games = Games[player];
        if (games.length <= gameId) revert Errors.IndexOutOfBounds(gameId);

        return games[gameId];
    }

    // @notice Returns all games that an address is Player 1 for.
    function listGamesFor(address player) public view returns (Game[] memory) {
        return Games[player];
    }

    // @notice Return time left after Player 2 has revealed their move.
    function getTimeLeft(address player, uint256 gameId) public view returns (uint256) {
        Game memory game = getGame(player, gameId);
        if (_didTimerRunOut(game.timerStart)) revert Errors.TimerFinished();
        if (game.p2 == address(0)) revert Errors.NoActiveTimer();
        return REVEAL_TIMEOUT - (block.timestamp - game.timerStart);
    }

    // @notice Return entry fee for a game being played.
    function getGameEntryFee(address player, uint256 gameId) public view returns (uint256) {
        Game memory game = getGame(player, gameId);
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
        Game memory game;
        game.entryFee = entryFee;
        game.p1SaltedChoice = encChoice;

        Games[msg.sender].push(game);
        _subtractFromBalance(msg.sender, entryFee);
        emit CreatedGame(msg.sender, entryFee, block.timestamp);
    }

    // @notice Allows p2 to join an existing game by gameId
    function joinGame(
        address p1,
        uint256 gameId,
        Choices p2Choice,
        uint256 entryFee
    ) public checkAddressHasSufficientBalance(entryFee) whenNotPaused {
        if (p1 == msg.sender) revert Errors.CannotJoinGame(false, true);

        Game[] storage games = Games[p1];
        if (games.length <= gameId) revert Errors.IndexOutOfBounds(gameId);

        Game storage game = games[gameId];
        if (game.p2 != address(0)) revert Errors.CannotJoinGame(true, false);
        if (entryFee < game.entryFee) revert Errors.AmountTooLow(entryFee, game.entryFee);

        game.p2 = msg.sender;
        game.p2Choice = p2Choice;
        game.timerStart = block.timestamp;

        _subtractFromBalance(msg.sender, entryFee);
        emit JoinedGameOf(msg.sender, p1, gameId, entryFee, block.timestamp);
    }

    /* ========================================================================================= */
    // Reveal / Resolve
    /* ========================================================================================= */

    // @notice P1 can resolve the game by sending their clear-text move after P2 makes a move
    function resolveGameP1(uint256 gameId, string calldata movePw) public whenNotPaused {
        Game memory game = getGame(msg.sender, gameId);
        if (game.p2 == address(0)) revert Errors.NoSecondPlayer();
        Choices p1Choice = _getHashChoice(game.p1SaltedChoice, movePw);

        _chooseWinner(p1Choice, game.p2Choice, msg.sender, game.p2, game.entryFee*2);
    }

    // @notice If no resolveGameP1 within the alotted time, P2 can take the pot
    //         by resolving after REVEAL_TIMEOUT has elapsed.
    //         This prevents P1 from griefing by never revealing their move, essentially
    //         forcing a deadlock.
    function resolveGameP2(address p1, uint256 gameId) public whenNotPaused {
        Game memory game = getGame(p1, gameId);

        if (game.p2 == address(0)) revert Errors.NoSecondPlayer();
        if (game.p2 != msg.sender) revert Errors.NotSecondPlayer(game.p2, msg.sender);
        if (!_didTimerRunOut(game.timerStart)) revert Errors.TimerStillRunning();

        _payout(msg.sender, game.entryFee*2);
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

        if (p1Choice == Choices.FORFEIT) {
            _payout(p2, gameBalance);
            emit WonGameAgainst(p2, p2Choice, p1, p1Choice, gameBalance, block.timestamp);
            return;
        }

        if (p2Choice == Choices.FORFEIT) {
            _payout(p1, gameBalance);
            emit WonGameAgainst(p1, p1Choice, p2, p2Choice, gameBalance, block.timestamp);
            return;
        }

        _payout(p2, gameBalance);
        emit WonGameAgainst(p2, p2Choice, p1, p1Choice, gameBalance, block.timestamp);
    }

    function _didTimerRunOut(uint256 timerStart) internal view returns (bool) {
        return block.timestamp > timerStart + REVEAL_TIMEOUT;
    }

    function _getHashChoice(bytes32 hashChoice, string calldata clearChoice)
        internal
        pure
        returns (Choices)
    {
        bytes32 hashedClearChoice = sha256(abi.encodePacked(clearChoice));
        if (hashChoice != hashedClearChoice) revert Errors.InvalidPassword();

        bytes1 first = bytes(clearChoice)[0];

        if (first == 0x30) {
            return Choices.ROCK;
        } else if (first == 0x31) {
            return Choices.PAPER;
        } else if (first == 0x32) {
            return Choices.SCISSORS;
        }

        return Choices.FORFEIT;
    }
}
