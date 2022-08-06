// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.15;

library Errors {
    string constant IndexOutOfBounds = "ioob";
    string constant CannotRemoveGame = "crg";
    string constant AmountTooLow = "atl";
    string constant CannotJoinGame = "cjg";
    string constant NoSecondPlayer = "nsp";
    string constant TimerStillRunning = "tsr";
    string constant NotEnoughMoneyInContract = "nemic";
    string constant InvalidPassword = "ip";
    string constant TimerFinished = "tf";
    string constant NoActiveTimer = "nat";
}

contract Rps {
    /* address public constant OWNER = ; */
    uint256 public MIN_ENTRY_FEE = 10000000 gwei; // 0.01 eth
    uint8 public TAX_PERCENT = 5;
    uint32 public REVEAL_TIMEOUT = 48 hours;
    address payable owner; /* 0x... */

    enum Choices { ROCK, PAPER, SCISSORS, FORFEIT }

    struct Game {
        uint256 entryFee;
        bytes32 p1SaltedChoice;

        address p2;
        Choices p2Choice;

        uint256 timerStart;
    }

    mapping(address => Game[]) Games;

    event CreatedGame(address indexed, uint256, uint256);
    event RemovedGame(address indexed, uint8, uint256);
    event JoinedGameOf(address indexed, address indexed, uint256, uint256, uint256);
    event WonGameAgainst(address indexed, Choices, address indexed, Choices, uint256, uint256);
    event GameDraw(address indexed, Choices, address indexed, Choices, uint256, uint256);
    event PaidOut(address indexed, uint256, uint256);

    modifier onlyOwner {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    function rcv() public payable {}

    function getGame(address player, uint8 gameId) public view returns (Game memory) {
        Game[] storage games = Games[player];
        require(games.length > gameId, Errors.IndexOutOfBounds);

        return games[gameId];
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getTimeLeft(address player, uint8 gameId) public view returns (uint) {
        Game memory game = getGame(player, gameId);
        require(!didTimerRunOut(game.timerStart), Errors.TimerFinished);
        require(game.p2 != address(0), Errors.NoActiveTimer);
        return REVEAL_TIMEOUT - (block.timestamp - game.timerStart);
    }

    function getGameEntryFee(address player, uint8 gameId) public view returns (uint) {
        Game memory game = getGame(player, gameId);
        return game.entryFee;
    }

    function listgames(address player) public view returns (Game[] memory) {
        return Games[player];
    }

    function changeMinEntryFee(uint256 mintEntryFee) public onlyOwner {
        MIN_ENTRY_FEE = mintEntryFee;
    }

    function changeTaxPercent(uint8 taxPercent) public onlyOwner {
        TAX_PERCENT = taxPercent;
    }

    function changeRevealTimeout(uint32 revealTimeout) public onlyOwner {
        REVEAL_TIMEOUT = revealTimeout;
    }

    function makeGame(bytes32 encChoice) public payable {
        require(msg.value >= MIN_ENTRY_FEE, Errors.AmountTooLow);
        Game memory game;
        game.entryFee = msg.value;
        game.p1SaltedChoice = encChoice;

        Games[msg.sender].push(game);
        emit CreatedGame(msg.sender, msg.value, block.timestamp);
    }

    function joinGame(
        address p1,
        uint8 gameId,
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

    function resolveGameP1(uint8 gameId, string calldata movePw) public {
        Game memory game = getGame(msg.sender, gameId);
        require(game.p2 != address(0), Errors.NoSecondPlayer);

        Choices p1Choice = getHashChoice(game.p1SaltedChoice, movePw);

        removeGame(msg.sender, gameId);
        chooseWinner(p1Choice, game.p2Choice, msg.sender, game.p2, game.entryFee);
    }

    function resolveGameP2(address p1, uint8 gameId) public {
        Game memory game = getGame(p1, gameId);
        require(game.p2 != address(0), Errors.NoSecondPlayer);
        require(didTimerRunOut(game.timerStart), Errors.TimerStillRunning);

        removeGame(p1, gameId);
        payoutWithAppliedTax(msg.sender, game.entryFee);
    }

    function removeGameP1(address p1, uint8 gameId) public {
        require(msg.sender == p1, Errors.CannotRemoveGame);
        Game[] storage games = Games[msg.sender];
        Game memory game = getGame(p1, gameId);

        games[gameId] = games[games.length - 1];
        games.pop();

        if (game.p2 != address(0)) {
            payoutWithAppliedTax(game.p2, game.entryFee);
        }
        emit RemovedGame(p1, gameId, block.timestamp);
    }

    function chooseWinner(
        Choices p1Choice,
        Choices p2Choice,
        address p1,
        address p2,
        uint256 entryFee
        ) public {
        if (p1Choice == p2Choice) {
            payoutWithAppliedTax(p1, entryFee / 2);
            payoutWithAppliedTax(p2, entryFee / 2);
            emit GameDraw(p1, p1Choice, p2, p2Choice, entryFee, block.timestamp);
            return;
        }

        if (p1Choice == Choices.PAPER && p2Choice == Choices.ROCK
        || p1Choice == Choices.ROCK && p2Choice == Choices.SCISSORS
        || p1Choice == Choices.SCISSORS && p2Choice == Choices.PAPER) {
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

    function removeGame(address p1,  uint8 gameId) public {
        Game[] storage games = Games[p1];
        require(games.length != 0, Errors.CannotRemoveGame);
        require(games.length > gameId, Errors.IndexOutOfBounds);

        games[gameId] = games[games.length - 1];
        games.pop();
        emit RemovedGame(p1, gameId, block.timestamp);
    }

    function payoutWithAppliedTax(address winner, uint256 initalBet) public {
        uint256 pot = (initalBet * 2) - (((initalBet * 2) / 100) * TAX_PERCENT);
        require(address(this).balance > pot, Errors.NotEnoughMoneyInContract);

        payable(winner).transfer(pot);
        emit PaidOut(winner, pot, block.timestamp);
    }

    function didTimerRunOut(uint256 timerStart) private view returns (bool){
        return block.timestamp > timerStart + REVEAL_TIMEOUT;
    }

    function getHashChoice(bytes32 hashChoice, string calldata clearChoice) public pure returns (Choices) {
        bytes32 hashedClearChoice = sha256(abi.encodePacked(clearChoice));
        require(hashChoice == hashedClearChoice, Errors.InvalidPassword);

        return getChoiceFromStr(clearChoice);
    }

    function getChoiceFromStr(string calldata clearChoice) public pure returns (Choices) {
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
