import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, utils } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers, network } from "hardhat";

enum Choices {
  ROCK,
  PAPER,
  SCISSORS
}

enum Result {
  P1,
  P2,
  DRAW
}

describe("Rock, Paper, Scissors", function () {
  async function deployRps() {

    const Rps = await ethers.getContractFactory("Rps");
    const rps = await Rps.deploy();

    return { rps };
  };

  async function createGame() {
    const Rps = await ethers.getContractFactory("Rps");
    const rps = await Rps.deploy();

    const [p1] = await ethers.getSigners();

    const clearChoice = Choices.PAPER + "-" + "test";
    const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

    const tokenamount = ethers.utils.parseEther("0.1"); /* 0.1 Eth */

    await rps.connect(p1).makeWager(hashedChoice, { value: tokenamount });

    return { rps, p1, clearChoice, tokenamount };
  };

  describe("makeWager", function () {
    it("Should create a game", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();

      const clearChoice = "2-test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const weiamount = BigNumber.from("100000000000000000"); /* 0.1 Eth */

      await rps.connect(p1).makeWager(hashedChoice, { value: weiamount });
      const wager = await rps.connect(p1).getWager(p1.address, 0);

      expect(wager.p1SaltedChoice).to.equal(hashedChoice);
      expect(wager.tokenamount).to.equal(weiamount);
      expect(wager.hasP2).to.equal(false);
    });

    it("Should revert on bet below minimum", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();

      const clearChoice = Choices.PAPER + "-" + "test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const weiamount = BigNumber.from("900000000000000"); /* 0.09 Eth */

      await expect(rps.connect(p1).makeWager(hashedChoice, { value: weiamount })).to.be.revertedWith("Bet amount too low");
    });
  });

  describe("joinWager", function () {
    it("Should let p2 join the game", async function () {
      const { rps, p1, tokenamount } = await loadFixture(createGame);
      const [_, p2] = await ethers.getSigners();
      const p2Choice = Choices.PAPER;
      const wagerIndex = 0;

      await rps.connect(p2).joinWager(p1.address, wagerIndex, p2Choice, { value: tokenamount });
      const wager = await rps.connect(p1).getWager(p1.address, wagerIndex);

      expect(wager.hasP2).to.equal(true);
      expect(wager.p2).to.equal(p2.address);
      expect(wager.p2Choice).to.equal(p2Choice);
    });

    it("Should revert on too few tokens sent by p2", async function () {
      const { rps, p1 } = await loadFixture(createGame);
      const [_, p2] = await ethers.getSigners();
      const p2Choice = Choices.PAPER;
      const wagerIndex = 0;

      await expect(rps.connect(p2).joinWager(p1.address, wagerIndex, p2Choice, { value: BigNumber.from("100000000") })).to.revertedWith("Tokenamount to low");
    });

    it("Should revert on index out of bounds p2", async function () {
      const { rps, p1, tokenamount } = await loadFixture(createGame);
      const [_, p2] = await ethers.getSigners();
      const p2Choice = Choices.PAPER;
      const wagerIndex = 1;

      await expect(rps.connect(p2).joinWager(p1.address, wagerIndex, p2Choice, { value: tokenamount })).to.revertedWith("Index out of bounds");
    });

    it("Should revert on player joining his own game", async function () {
      const { rps, p1, tokenamount } = await loadFixture(createGame);
      const p1Choice = Choices.PAPER;
      const wagerIndex = 0;

      await expect(rps.connect(p1).joinWager(p1.address, wagerIndex, p1Choice, { value: tokenamount })).to.revertedWith("You can't join your own game");
    });

    it("Should revert if wager already has a second player", async function () {
      const { rps, p1, tokenamount } = await loadFixture(createGame);
      const [_, p2, p3] = await ethers.getSigners();
      const p2Choice = Choices.PAPER;
      const p3Choice = Choices.ROCK;
      const wagerIndex = 0;

      await rps.connect(p2).joinWager(p1.address, wagerIndex, p2Choice, { value: tokenamount });
      await expect(rps.connect(p3).joinWager(p1.address, wagerIndex, p3Choice, { value: tokenamount })).to.revertedWith("Wager already has a second player");
    });
  });

  describe("resolveWagerP1", function () {
    it("Should revert on index out of bounds", async function () {
      const { rps, p1, clearChoice, tokenamount } = await loadFixture(createGame);
      const [_, p2] = await ethers.getSigners();
      const p2Choice = Choices.PAPER;
      const wagerIndex = 0;

      await rps.connect(p2).joinWager(p1.address, wagerIndex, p2Choice, { value: tokenamount });

      const oufOfBoundsIndex = 1;

      await expect(rps.connect(p1).resolveWagerP1(oufOfBoundsIndex, clearChoice)).to.revertedWith("Index out of bounds");
    });

    it("Should revert if wager doesnt have a second player", async function () {
      const { rps, p1, clearChoice } = await loadFixture(createGame);

      await expect(rps.connect(p1).resolveWagerP1(0, clearChoice)).to.revertedWith("Wager doesn't have a second player");
    });

    it("Should let p1 resolve the wager", async function () {
      const { rps, p1, clearChoice, tokenamount } = await loadFixture(createGame);
      const [_, p2] = await ethers.getSigners();
      const wagerIndex = 0;
      const p2Choice = Choices.PAPER;
      await rps.connect(p2).joinWager(p1.address, wagerIndex, p2Choice, { value: tokenamount });

      await expect(await rps.connect(p1).resolveWagerP1(wagerIndex, clearChoice)).to.not.reverted;
    });

    it("Shouldn't let p1 resolve the wager if doesn't have one", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();
      const wagerIndex = 0;
      const wagerClearChoice = "test";

      await expect(rps.connect(p1).resolveWagerP1(wagerIndex, wagerClearChoice)).to.revertedWith("Index out of bounds");
    })
  });

  describe("resolveWagerP2", function () {
    it("Shouldn't let p2 resolve the wager if timer is still running", async function () {
      const Rps = await ethers.getContractFactory("Rps");
      const rps = await Rps.deploy();

      const [p1] = await ethers.getSigners();

      const clearChoice = Choices.PAPER + "-" + "test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const tokenamount = ethers.utils.parseEther("0.1"); /* 0.1 Eth */

      await rps.connect(p1).makeWager(hashedChoice, { value: tokenamount });

      const [_, p2] = await ethers.getSigners();
      const wagerIndex = 0;
      const p2Choice = Choices.PAPER;

      await rps.connect(p2).joinWager(p1.address, wagerIndex, p2Choice, { value: tokenamount });

      await expect(rps.connect(p2).resolveWagerP2(p1.address, wagerIndex)).to.revertedWith("Timer didn't run out yet");
    });

    it("Shouldn't let p2 resolve the wager if wager doesn't have a second player", async function () {
      const Rps = await ethers.getContractFactory("Rps");
      const rps = await Rps.deploy();

      const [p1] = await ethers.getSigners();

      const clearChoice = Choices.PAPER + "-" + "test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const tokenamount = ethers.utils.parseEther("0.1"); /* 0.1 Eth */

      await rps.connect(p1).makeWager(hashedChoice, { value: tokenamount });

      const [_, p2] = await ethers.getSigners();
      const wagerIndex = 0;

      await expect(rps.connect(p2).resolveWagerP2(p1.address, wagerIndex)).to.revertedWith("Wager doesn't have a second player");
    });

    it("Should clean up after resolve", async function () {
      const Rps = await ethers.getContractFactory("Rps");
      const rps = await Rps.deploy();

      const [p1] = await ethers.getSigners();

      const clearChoice = Choices.PAPER + "-" + "test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const tokenamount = ethers.utils.parseEther("0.1"); /* 0.1 Eth */

      await rps.connect(p1).makeWager(hashedChoice, { value: tokenamount });
      const [_, p2] = await ethers.getSigners();
      const wagerIndex = 0;
      const p2Choice = Choices.PAPER;
      await rps.connect(p2).joinWager(p1.address, wagerIndex, p2Choice, { value: tokenamount });
      await rps.connect(p1).resolveWagerP1(wagerIndex, clearChoice);

      await expect(rps.connect(p1).getWager(p1.address, wagerIndex)).to.be.revertedWith("Index out of bounds");
    });

    it("Should let p2 resolve the wager if the timer ran out", async function () {
      const Rps = await ethers.getContractFactory("Rps");
      const rps = await Rps.deploy();

      const [p1] = await ethers.getSigners();

      const clearChoice = Choices.PAPER + "-" + "test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const tokenamount = ethers.utils.parseEther("0.1"); /* 0.1 Eth */
      const revealTimeout = await (await rps.REVEAL_TIMEOUT());

      await rps.connect(p1).makeWager(hashedChoice, { value: tokenamount });
      const [_, p2] = await ethers.getSigners();
      const wagerIndex = 0;

      const p2Choice = Choices.PAPER;
      await rps.connect(p2).joinWager(p1.address, wagerIndex, p2Choice, { value: tokenamount });

      await network.provider.send("evm_increaseTime", [revealTimeout]);
      await network.provider.send("evm_mine");

      const p2Bal = await p2.getBalance();
      await rps.connect(p2).resolveWagerP2(p1.address ,wagerIndex);

      await expect((await p2.getBalance()).sub(p2Bal)).to.be.approximately(parseEther("0.19"), parseEther("0.01"));
      await expect(rps.connect(p1).getWager(p1.address, wagerIndex)).to.be.revertedWith("Index out of bounds");
    });
  });

  describe("getHashChoice", function () {
    it("Should return Scissors", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();
      const choice = Choices.SCISSORS;

      const clearChoice = `${choice}-test`;
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      await expect(await rps.connect(p1).getHashChoice(hashedChoice, clearChoice)).to.equal(choice);
    });

    it("Should return Paper", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();
      const choice = Choices.PAPER;

      const clearChoice = `${choice}-test`;
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      await expect(await rps.connect(p1).getHashChoice(hashedChoice, clearChoice)).to.equal(choice);
    });

    it("Should return Rock", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();
      const choice = Choices.ROCK;

      const clearChoice = `${choice}-test`;
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      await expect(await rps.connect(p1).getHashChoice(hashedChoice, clearChoice)).to.equal(choice);
    });
  });

  describe("chooseWinner", function () {
    it("Should pay p1 when paper and rock", async function() {
      const { rps } = await loadFixture(deployRps);
      const [p1, p2] = await ethers.getSigners();

      const p1Choice = Choices.PAPER;
      const p2Choice = Choices.ROCK;
      const bet = parseEther("0.1");
      await rps.connect(p1).rcv({ value: bet.mul(2) });

      const p1Bal = await p1.getBalance();
      await rps.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, bet);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(bet.mul(2), parseEther("0.05"));
    });

    it("Should return p1 when rock and scissors", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1, p2] = await ethers.getSigners();

      const p1Choice = Choices.ROCK;
      const p2Choice = Choices.SCISSORS;
      const bet = parseEther("0.1");
      await rps.connect(p1).rcv({ value: bet.mul(2) });

      const p1Bal = await p1.getBalance();
      await rps.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, bet);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(bet.mul(2), parseEther("0.05"));
    });

    it("Should return p1 when scissors and paper", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1, p2] = await ethers.getSigners();

      const p1Choice = Choices.SCISSORS;
      const p2Choice = Choices.PAPER;
      const bet = parseEther("0.1");
      await rps.connect(p1).rcv({ value: bet.mul(2) });

      const p1Bal = await p1.getBalance();
      await rps.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, bet);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(bet.mul(2), parseEther("0.05"));
    });

    it("Should return draw when p1==p2", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1, p2] = await ethers.getSigners();

      const p1Choice = Choices.PAPER;
      const p2Choice = Choices.PAPER;
      const bet = parseEther("0.1");
      await rps.connect(p1).rcv({ value: bet.mul(2) });

      const p1Bal = await p1.getBalance();
      const p2Bal = await p2.getBalance();
      await rps.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, bet);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(bet, parseEther("0.008"));
      await expect(await (await p2.getBalance()).sub(p2Bal)).to.approximately(bet, parseEther("0.008"));
    });
  });

  describe("payoutWithAppliedTax", function () {
    it("Should revert if contract doesn't have enough tokens", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();
      const tokenamount = utils.parseEther("1");

      await expect(rps.payoutWithAppliedTax(p1.address, tokenamount)).to.revertedWith("Not enough tokens in contract");
    })

    it("Should applay tax", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();

      const initialBet = ethers.utils.parseEther("0.5");
      const TAX = await (await rps.TAX_PERCENT());

      const payout = (initialBet.mul(2)).sub(((initialBet.mul(2)).div(100)).mul(TAX));
      const expectedBal = (initialBet.mul(2)).sub(payout);

      await rps.connect(p1).rcv({ value: initialBet.mul(2) });
      await rps.payoutWithAppliedTax(p1.address, initialBet);

      await expect(await rps.getBalance()).to.equal(expectedBal);
    })
  })

  describe("removeWager", function() {
    it("Should remove a wager and update its position", async function() {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();

      const clearChoice = "2-test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);
      const w1 = 0;

      const weiamount = parseEther("0.1"); /* 0.1 Eth */
      const weiamount2 = parseEther("0.2"); /* 0.1 Eth */

      await rps.connect(p1).makeWager(hashedChoice, { value: weiamount });
      await rps.connect(p1).makeWager(hashedChoice, { value: weiamount2 });

      await rps.connect(p1).removeWagerP1(p1.address, w1);
      
      expect(await (await rps.connect(p1).getWager(p1.address, w1)).tokenamount).to.equal(weiamount2);
    });

    it("Should forfeit if wager has p2", async function() {
      const { rps } = await loadFixture(deployRps);
      const [p1, p2] = await ethers.getSigners();

      const clearChoice = "2-test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);
      const w1 = 0;

      const weiamount = parseEther("0.1"); /* 0.1 Eth */

      await rps.connect(p1).makeWager(hashedChoice, { value: weiamount });
      await rps.connect(p2).joinWager(p1.address, w1, Choices.PAPER, { value: weiamount});
      const p2Bal = await p2.getBalance();

      await rps.connect(p1).removeWagerP1(p1.address, w1);
      
      await expect((await p2.getBalance()).sub(p2Bal)).to.be.approximately(parseEther("0.19"), parseEther("0.01"));
    })

    it("Should revert if caller isn't the wager owner", async function() {
      const { rps } = await loadFixture(deployRps);
      const [p1, p2] = await ethers.getSigners();

      const clearChoice = "2-test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);
      const w1 = 0;

      const weiamount = parseEther("0.1"); /* 0.1 Eth */

      await rps.connect(p1).makeWager(hashedChoice, { value: weiamount });
      await rps.connect(p2).joinWager(p1.address, w1, Choices.PAPER, { value: weiamount});

      await expect(rps.connect(p2).removeWagerP1(p1.address, w1)).to.be.revertedWith("You can only remove your own wagers");
    })
  })

  describe("Concurrency Tests", function() {
    it("Should allow multiple games", async function() {
      const Rps = await ethers.getContractFactory("Rps");
      const rps = await Rps.deploy();

      const [p1, p2] = await ethers.getSigners();
      const wagerIndex = 0;
      const p2Choice = Choices.PAPER;

      const clearChoice = Choices.PAPER + "-" + "test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const tokenamount = ethers.utils.parseEther("0.1");

      for (let i=0; i<100; i++) {
        await rps.connect(p1).makeWager(hashedChoice, { value: tokenamount });
      }

      for (let i=0; i<100; i++) {
        await rps.connect(p2).joinWager(p1.address, i, p2Choice, { value: tokenamount });
      }

      const p1Bal = await p1.getBalance();
      const p2Bal = await  p2.getBalance();

      for (let i=0; i<100; i++) {
        expect(await rps.connect(p1).resolveWagerP1(wagerIndex, clearChoice)).to.not.reverted;
      }

      expect(await (await rps.getBalance())).to.be.equal(parseEther("1"));
      expect(await (await p1.getBalance()).sub(p1Bal)).to.be.approximately(parseEther("10"), parseEther("1"));
      expect(await (await p2.getBalance()).sub(p2Bal)).to.be.approximately(parseEther("10"), parseEther("1"));
    })
  })
});
