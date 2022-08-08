// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
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
contract PRS is Ownable, TaxableGame {
    uint32 public REVEAL_TIMEOUT = 2 hours;

    enum Choices {
        ROCK,
        PAPER,
        SCISSORS,
        FORFEIT
    }

    struct Game {
        uint256 entryFee;
        bytes32 p1SaltedChoice;
        address p2;
        Choices p2Choice;
        uint256 timerStart;
    }

    mapping(address => Game[]) Games;

    event CreatedGame(address indexed, uint256, uint256);
    event JoinedGameOf(address indexed, address indexed, uint256, uint256, uint256);
    event WonGameAgainst(address indexed, Choices, address indexed, Choices, uint256, uint256);
    event GameDraw(address indexed, Choices, address indexed, Choices, uint256, uint256);

    function setRevealTimeout(uint32 revealTimeout) public onlyOwner {
        REVEAL_TIMEOUT = revealTimeout;
    }

    function getTimeLeft(address player, uint256 gameId) public view returns (uint256) {
        Game memory game = getGame(player, gameId);
        require(!didTimerRunOut(game.timerStart), Errors.TimerFinished);
        require(game.p2 != address(0), Errors.NoActiveTimer);
        return REVEAL_TIMEOUT - (block.timestamp - game.timerStart);
    }

    function getGame(address player, uint256 gameId) public view returns (Game memory) {
        Game[] storage games = Games[player];
        require(games.length > gameId, Errors.IndexOutOfBounds);

        return games[gameId];
    }

    function listGames(address player) public view returns (Game[] memory) {
        return Games[player];
    }

    function getGameEntryFee(address player, uint256 gameId) public view returns (uint256) {
        Game memory game = getGame(player, gameId);
        return game.entryFee;
    }

    // @notice Whoever calls this makes a new game and becomes "p1"
    function makeGame(bytes32 encChoice) public payable {
        require(msg.value >= MIN_ENTRY_FEE, Errors.AmountTooLow);
        Game memory game;
        game.entryFee = msg.value;
        game.p1SaltedChoice = encChoice;

        Games[msg.sender].push(game);
        emit CreatedGame(msg.sender, msg.value, block.timestamp);
    }

    // @notice Allows p2 to join an existing game by gameId
    function joinGame(
        address p1,
        uint256 gameId,
        Choices p2Choice
    ) public payable {
        require(p1 != msg.sender, Errors.CannotJoinGame);

        Game[] storage games = Games[p1];
        require(games.length > gameId, Errors.IndexOutOfBounds);

        Game storage game = games[gameId];
        require(game.p2 == address(0), Errors.CannotJoinGame);
        require(msg.value >= game.entryFee, Errors.AmountTooLow);

        game.p2 = msg.sender;
        game.p2Choice = p2Choice;
        game.timerStart = block.timestamp;
        emit JoinedGameOf(msg.sender, p1, gameId, msg.value, block.timestamp);
    }

    function resolveGameP1(uint256 gameId, string calldata movePw) public {
        Game memory game = getGame(msg.sender, gameId);
        require(game.p2 != address(0), Errors.NoSecondPlayer);

        Choices p1Choice = getHashChoice(game.p1SaltedChoice, movePw);

        chooseWinner(p1Choice, game.p2Choice, msg.sender, game.p2, game.entryFee);
    }

    function resolveGameP2(address p1, uint256 gameId) public {
        Game memory game = getGame(p1, gameId);
        require(game.p2 != address(0), Errors.NoSecondPlayer);
        require(didTimerRunOut(game.timerStart), Errors.TimerStillRunning);

        payoutWithAppliedTax(msg.sender, game.entryFee);
    }

    function chooseWinner(
        Choices p1Choice,
        Choices p2Choice,
        address p1,
        address p2,
        uint256 entryFee
    ) internal {
        if (p1Choice == p2Choice) {
            payoutWithAppliedTax(p1, entryFee / 2);
            payoutWithAppliedTax(p2, entryFee / 2);
            emit GameDraw(p1, p1Choice, p2, p2Choice, entryFee, block.timestamp);
            return;
        }

        if (
            (p1Choice == Choices.PAPER && p2Choice == Choices.ROCK) ||
            (p1Choice == Choices.ROCK && p2Choice == Choices.SCISSORS) ||
            (p1Choice == Choices.SCISSORS && p2Choice == Choices.PAPER)
        ) {
            payoutWithAppliedTax(p1, entryFee);
            emit WonGameAgainst(p1, p1Choice, p2, p2Choice, entryFee, block.timestamp);
            return;
        }

        if (p1Choice == Choices.FORFEIT) {
            payoutWithAppliedTax(p2, entryFee);
            emit WonGameAgainst(p2, p2Choice, p1, p1Choice, entryFee, block.timestamp);
            return;
        }

        if (p2Choice == Choices.FORFEIT) {
            payoutWithAppliedTax(p1, entryFee);
            emit WonGameAgainst(p1, p1Choice, p2, p2Choice, entryFee, block.timestamp);
            return;
        }

        payoutWithAppliedTax(p2, entryFee);
        emit WonGameAgainst(p2, p2Choice, p1, p1Choice, entryFee, block.timestamp);
    }

    function didTimerRunOut(uint256 timerStart) internal view returns (bool) {
        return block.timestamp > timerStart + REVEAL_TIMEOUT;
    }

    function getHashChoice(bytes32 hashChoice, string calldata clearChoice)
        internal
        pure
        returns (Choices)
    {
        bytes32 hashedClearChoice = sha256(abi.encodePacked(clearChoice));
        require(hashChoice == hashedClearChoice, Errors.InvalidPassword);

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
