// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Rps {
    /* address public constant OWNER = ; */
    uint public MIN_BET = 10000000 gwei; // 0.01 eth
    uint8 public TAX_PERCENT = 5;
    uint32 public REVEAL_TIMEOUT = 48 hours;
    address payable owner; /* 0x... */

    enum Choices {
        ROCK,
        PAPER,
        SCISSORS
    }
    Choices[3] winChoices = [Choices.SCISSORS, Choices.ROCK, Choices.PAPER];

    enum Winner {
        P1,
        P2,
        DRAW
    }

    struct Wager {
        uint256 tokenamount;
        bytes32 p1SaltedChoice;

        bool hasP2;
        address p2;
        Choices p2Choice;

        uint timerStart;
    }

    struct Player {
        Wager[] wagers;
    }

    mapping(address => Player) players;

    function makeWager(bytes32 encChoice) public payable {
        require(msg.value >= MIN_BET, "Bet amount too low");
        Wager memory wager;
        wager.hasP2 = false;
        wager.tokenamount = msg.value;
        wager.p1SaltedChoice = encChoice;

        players[msg.sender].wagers.push(wager);
        emit CreatedWager(msg.sender, msg.value, block.timestamp);
    }

    function joinWager(address p1, uint8 wagerIndex, Choices p2Choice) public payable {
        require(p1 != msg.sender, "You can't join your own game");

        Wager[] storage wagers = players[p1].wagers;
        require(wagers.length >= wagerIndex + 1, "Index out of bounds");

        Wager storage wager = wagers[wagerIndex];
        require(!wager.hasP2, "Wager already has a second player");
        require(msg.value >= wager.tokenamount, "Tokenamount to low");

        wager.hasP2 = true;
        wager.p2 = msg.sender;
        wager.p2Choice = p2Choice;
        wager.timerStart = block.timestamp;
        emit JoinedWagerOf(msg.sender, p1, wagerIndex, msg.value, block.timestamp);
    }

    function resolveWagerP1(uint8 wagerIndex, string calldata movePw) public {
        Wager memory wager = getWager(msg.sender, wagerIndex);
        require(wager.hasP2, "Wager doesn't have a second player");

        Choices p1Choice = getHashChoice(wager.p1SaltedChoice, movePw);

        removeWager(msg.sender, wagerIndex);
        chooseWinner(p1Choice,wager.p2Choice, msg.sender, wager.p2, wager.tokenamount);
    }

    function resolveWagerP2(address p1, uint8 wagerIndex) public {
        Wager memory wager = getWager(p1, wagerIndex);
        require(wager.hasP2, "Wager doesn't have a second player");
        require(didTimerRunOut(wager.timerStart), "Timer didn't run out yet");

        removeWager(p1, wagerIndex);
        payoutWithAppliedTax(msg.sender, wager.tokenamount);
    }

    function chooseWinner(Choices p1Choice, Choices p2Choice, address p1, address p2, uint256 initialBet) public {
        if (p1Choice == p2Choice) {
            payoutWithAppliedTax(p1, initialBet / 2);
            payoutWithAppliedTax(p2, initialBet / 2);
            emit WagerDraw(p1, p1Choice, p2, p2Choice, initialBet, block.timestamp);
            return;
        }

        if (winChoices[uint8(p1Choice)] == p2Choice) {
            payoutWithAppliedTax(p1, initialBet);
            emit WonWagerAgainst(p1, p1Choice, p2, p2Choice, initialBet, block.timestamp);
            return;
        }
        
        payoutWithAppliedTax(p2, initialBet);
        emit WonWagerAgainst(p2, p2Choice, p1, p1Choice, initialBet, block.timestamp);
    }

    /* private */
    function removeWager(address p1,  uint8 wagerIndex) public {
        Wager[] storage wagers = players[p1].wagers;
        require(wagers.length != 0, "No wagers to be removed");
        require(wagers.length >= wagerIndex + 1, "Index out of bounds");

        wagers[wagerIndex] = wagers[wagers.length - 1];
        wagers.pop();
        emit RemovedWager(p1, wagerIndex, block.timestamp);
    }

    /* public */
    function removeWagerP1(address p1, uint8 wagerIndex) public {
        require(msg.sender == p1, "You can only remove your own wagers");
        Wager[] storage wagers = players[msg.sender].wagers;
        Wager memory wager = getWager(p1, wagerIndex);

        wagers[wagerIndex] = wagers[wagers.length - 1];
        wagers.pop();

        if (wager.hasP2) {
            payoutWithAppliedTax(wager.p2, wager.tokenamount);
        }
        emit RemovedWager(p1, wagerIndex, block.timestamp);
    }

    function payoutWithAppliedTax(address winner, uint256 initalBet) public {
        uint256 pot = (initalBet * 2) - (((initalBet * 2) / 100) * TAX_PERCENT);
        require(address(this).balance > pot, "Not enough tokens in contract");

        payable(winner).transfer(pot);
        emit PaidOut(winner, pot, block.timestamp);
    }

    function getHashChoice(bytes32 hashChoice, string calldata clearChoice) public pure returns (Choices) {
        bytes32 hashedClearChoice = sha256(abi.encodePacked(clearChoice));
        require(hashChoice == hashedClearChoice, "Password doesnt match encoded one");

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

        revert("Invalid choice");
    }

    function rcv() public payable {}

    function didTimerRunOut(uint256 timerStart) private view returns (bool){
        return block.timestamp > timerStart + REVEAL_TIMEOUT;
    }

    function getWager(address player, uint8 wagerIndex) public view returns (Wager memory) {
        Wager[] storage wagers = players[player].wagers;
        require(wagers.length >= wagerIndex + 1, "Index out of bounds");

        return wagers[wagerIndex];
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getTimeLeft(address player, uint8 wagerIndex) public view returns (uint) {
        Wager memory wager = getWager(player, wagerIndex);
        require(!didTimerRunOut(wager.timerStart), "Timer already finished");
        require(wager.hasP2, "Timer didn't start yet");
        return REVEAL_TIMEOUT - (block.timestamp - wager.timerStart);
    }

    function getWagerTokenamount(address player, uint8 wagerIndex) public view returns (uint) {
        Wager memory wager = getWager(player, wagerIndex);
        return wager.tokenamount;
    }

    function listWagers(address player) public view returns (Wager[] memory) {
        return players[player].wagers;
    }

    function ChangeMinBet(uint minBet) public onlyOwner {
        MIN_BET = minBet;
    }

    function ChangeTaxPercent(uint8 taxPercent) public onlyOwner {
        TAX_PERCENT = taxPercent;
    }

    function ChangeRevealTimeout(uint32 revealTimeout) public onlyOwner {
        REVEAL_TIMEOUT = revealTimeout;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    event CreatedWager(address indexed, uint256, uint256);
    event RemovedWager(address indexed, uint8, uint256);
    event JoinedWagerOf(address indexed, address indexed, uint8, uint256, uint256);
    event WonWagerAgainst(address indexed, Choices, address indexed, Choices, uint256, uint256);
    event WagerDraw(address indexed, Choices, address indexed, Choices, uint256, uint256);
    event PaidOut(address indexed, uint256, uint256);
}
