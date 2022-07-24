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

    const entryFee = ethers.utils.parseEther("0.1"); /* 0.1 Eth */

    await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });

    return { rps, p1, clearChoice, entryFee };
  };

  describe("makeGame", function () {
    it("Should create a game", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();

      const clearChoice = "2-test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const weiamount = BigNumber.from("100000000000000000"); /* 0.1 Eth */

      await rps.connect(p1).makeGame(hashedChoice, { value: weiamount });
      const game = await rps.connect(p1).getGame(p1.address, 0);

      expect(game.p1SaltedChoice).to.equal(hashedChoice);
      expect(game.entryFee).to.equal(weiamount);
      //expect(game.p2).to.equal();
    });

    it("Should revert on entryFee below minimum", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();

      const clearChoice = Choices.PAPER + "-" + "test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const weiamount = BigNumber.from("900000000000000"); /* 0.09 Eth */

      await expect(rps.connect(p1).makeGame(hashedChoice, { value: weiamount })).to.be.revertedWith("atl");
    });
  });

  describe("joinGame", function () {
    it("Should let p2 join the game", async function () {
      const { rps, p1, entryFee } = await loadFixture(createGame);
      const [_, p2] = await ethers.getSigners();
      const p2Choice = Choices.PAPER;
      const gameIndex = 0;

      await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
      const game = await rps.connect(p1).getGame(p1.address, gameIndex);

      expect(game.p2).to.equal(p2.address);
      expect(game.p2).to.equal(p2.address);
      expect(game.p2Choice).to.equal(p2Choice);
    });

    it("Should revert on too few tokens sent by p2", async function () {
      const { rps, p1 } = await loadFixture(createGame);
      const [_, p2] = await ethers.getSigners();
      const p2Choice = Choices.PAPER;
      const gameIndex = 0;

      await expect(rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: BigNumber.from("100000000") })).to.be.revertedWith("atl");
    });

    it("Should revert on index out of bounds p2", async function () {
      const { rps, p1, entryFee } = await loadFixture(createGame);
      const [_, p2] = await ethers.getSigners();
      const p2Choice = Choices.PAPER;
      const gameIndex = 1;

      await expect(rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee })).to.be.revertedWith("ioob");
    });

    it("Should revert on player joining his own game", async function () {
      const { rps, p1, entryFee } = await loadFixture(createGame);
      const p1Choice = Choices.PAPER;
      const gameIndex = 0;

      await expect(rps.connect(p1).joinGame(p1.address, gameIndex, p1Choice, { value: entryFee })).to.be.revertedWith("cjg");
    });

    it("Should revert if game already has a second player", async function () {
      const { rps, p1, entryFee } = await loadFixture(createGame);
      const [_, p2, p3] = await ethers.getSigners();
      const p2Choice = Choices.PAPER;
      const p3Choice = Choices.ROCK;
      const gameIndex = 0;

      await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
      await expect(rps.connect(p3).joinGame(p1.address, gameIndex, p3Choice, { value: entryFee })).to.be.revertedWith("cjg");
    });
  });

  describe("resolveGameP1", function () {
    it("Should revert on index out of bounds", async function () {
      const { rps, p1, clearChoice, entryFee } = await loadFixture(createGame);
      const [_, p2] = await ethers.getSigners();
      const p2Choice = Choices.PAPER;
      const gameIndex = 0;

      await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });

      const oufOfBoundsIndex = 1;

      await expect(rps.connect(p1).resolveGameP1(oufOfBoundsIndex, clearChoice)).to.be.revertedWith("ioob");
    });

    it("Should revert if game doesnt have a second player", async function () {
      const { rps, p1, clearChoice } = await loadFixture(createGame);

      await expect(rps.connect(p1).resolveGameP1(0, clearChoice)).to.be.revertedWith("nsp");
    });

    it("Should let p1 resolve the game", async function () {
      const { rps, p1, clearChoice, entryFee } = await loadFixture(createGame);
      const [_, p2] = await ethers.getSigners();
      const gameIndex = 0;
      const p2Choice = Choices.PAPER;
      await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });

      await expect(await rps.connect(p1).resolveGameP1(gameIndex, clearChoice)).to.not.reverted;
    });

    it("Shouldn't let p1 resolve the game if doesn't have one", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();
      const gameIndex = 0;
      const gameClearChoice = "test";

      await expect(rps.connect(p1).resolveGameP1(gameIndex, gameClearChoice)).to.be.revertedWith("ioob");
    })
  });

  describe("resolveGameP2", function () {
    it("Shouldn't let p2 resolve the game if timer is still running", async function () {
      const Rps = await ethers.getContractFactory("Rps");
      const rps = await Rps.deploy();

      const [p1] = await ethers.getSigners();

      const clearChoice = Choices.PAPER + "-" + "test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const entryFee = ethers.utils.parseEther("0.1"); /* 0.1 Eth */

      await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });

      const [_, p2] = await ethers.getSigners();
      const gameIndex = 0;
      const p2Choice = Choices.PAPER;

      await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });

      await expect(rps.connect(p2).resolveGameP2(p1.address, gameIndex)).to.revertedWith("tsr");
    });

    it("Shouldn't let p2 resolve the game if game doesn't have a second player", async function () {
      const Rps = await ethers.getContractFactory("Rps");
      const rps = await Rps.deploy();

      const [p1] = await ethers.getSigners();

      const clearChoice = Choices.PAPER + "-" + "test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const entryFee = ethers.utils.parseEther("0.1"); /* 0.1 Eth */

      await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });

      const [_, p2] = await ethers.getSigners();
      const gameIndex = 0;

      await expect(rps.connect(p2).resolveGameP2(p1.address, gameIndex)).to.revertedWith("nsp");
    });

    it("Should clean up after resolve", async function () {
      const Rps = await ethers.getContractFactory("Rps");
      const rps = await Rps.deploy();

      const [p1] = await ethers.getSigners();

      const clearChoice = Choices.PAPER + "-" + "test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const entryFee = ethers.utils.parseEther("0.1"); /* 0.1 Eth */

      await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });
      const [_, p2] = await ethers.getSigners();
      const gameIndex = 0;
      const p2Choice = Choices.PAPER;
      await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
      await rps.connect(p1).resolveGameP1(gameIndex, clearChoice);

      await expect(rps.connect(p1).getGame(p1.address, gameIndex)).to.be.revertedWith("ioob");
    });

    it("Should let p2 resolve the game if the timer ran out", async function () {
      const Rps = await ethers.getContractFactory("Rps");
      const rps = await Rps.deploy();

      const [p1] = await ethers.getSigners();

      const clearChoice = Choices.PAPER + "-" + "test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const entryFee = ethers.utils.parseEther("0.1"); /* 0.1 Eth */
      const revealTimeout = await (await rps.REVEAL_TIMEOUT());

      await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });
      const [_, p2] = await ethers.getSigners();
      const gameIndex = 0;

      const p2Choice = Choices.PAPER;
      await rps.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });

      await network.provider.send("evm_increaseTime", [revealTimeout]);
      await network.provider.send("evm_mine");

      const p2Bal = await p2.getBalance();
      await rps.connect(p2).resolveGameP2(p1.address ,gameIndex);

      await expect((await p2.getBalance()).sub(p2Bal)).to.be.approximately(parseEther("0.19"), parseEther("0.01"));
      await expect(rps.connect(p1).getGame(p1.address, gameIndex)).to.be.revertedWith("ioob");
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
      const entryFee = parseEther("0.1");
      await rps.connect(p1).rcv({ value: entryFee.mul(2) });

      const p1Bal = await p1.getBalance();
      await rps.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, entryFee);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(entryFee.mul(2), parseEther("0.05"));
    });

    it("Should pay p1 when rock and scissors", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1, p2] = await ethers.getSigners();

      const p1Choice = Choices.ROCK;
      const p2Choice = Choices.SCISSORS;
      const entryFee = parseEther("0.1");
      await rps.connect(p1).rcv({ value: entryFee.mul(2) });

      const p1Bal = await p1.getBalance();
      await rps.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, entryFee);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(entryFee.mul(2), parseEther("0.05"));
    });

    it("Should pay p1 when scissors and paper", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1, p2] = await ethers.getSigners();

      const p1Choice = Choices.SCISSORS;
      const p2Choice = Choices.PAPER;
      const entryFee = parseEther("0.1");
      await rps.connect(p1).rcv({ value: entryFee.mul(2) });

      const p1Bal = await p1.getBalance();
      await rps.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, entryFee);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(entryFee.mul(2), parseEther("0.05"));
    });

    it("Should pay both players when p1==p2", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1, p2] = await ethers.getSigners();

      const p1Choice = Choices.PAPER;
      const p2Choice = Choices.PAPER;
      const entryFee = parseEther("0.1");
      await rps.connect(p1).rcv({ value: entryFee.mul(2) });

      const p1Bal = await p1.getBalance();
      const p2Bal = await p2.getBalance();
      await rps.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, entryFee);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(entryFee, parseEther("0.008"));
      await expect(await (await p2.getBalance()).sub(p2Bal)).to.approximately(entryFee, parseEther("0.008"));
    });
  });

  describe("payoutWithAppliedTax", function () {
    it("Should revert if contract doesn't have enough tokens", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();
      const entryFee = utils.parseEther("1");

      await expect(rps.payoutWithAppliedTax(p1.address, entryFee)).to.revertedWith("nemic");
    })

    it("Should applay tax", async function () {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();

      const initialEntryFee = ethers.utils.parseEther("0.5");
      const TAX = await (await rps.TAX_PERCENT());

      const payout = (initialEntryFee.mul(2)).sub(((initialEntryFee.mul(2)).div(100)).mul(TAX));
      const expectedBal = (initialEntryFee.mul(2)).sub(payout);

      await rps.connect(p1).rcv({ value: initialEntryFee.mul(2) });
      await rps.payoutWithAppliedTax(p1.address, initialEntryFee);

      await expect(await rps.getBalance()).to.equal(expectedBal);
    })
  })

  describe("removeGame", function() {
    it("Should remove a game and update its position", async function() {
      const { rps } = await loadFixture(deployRps);
      const [p1] = await ethers.getSigners();

      const clearChoice = "2-test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);
      const w1 = 0;

      const weiamount = parseEther("0.1"); /* 0.1 Eth */
      const weiamount2 = parseEther("0.2"); /* 0.1 Eth */

      await rps.connect(p1).makeGame(hashedChoice, { value: weiamount });
      await rps.connect(p1).makeGame(hashedChoice, { value: weiamount2 });

      await rps.connect(p1).removeGameP1(p1.address, w1);
      
      expect(await (await rps.connect(p1).getGame(p1.address, w1)).entryFee).to.equal(weiamount2);
    });

    it("Should forfeit if game has p2", async function() {
      const { rps } = await loadFixture(deployRps);
      const [p1, p2] = await ethers.getSigners();

      const clearChoice = "2-test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);
      const w1 = 0;

      const weiamount = parseEther("0.1"); /* 0.1 Eth */

      await rps.connect(p1).makeGame(hashedChoice, { value: weiamount });
      await rps.connect(p2).joinGame(p1.address, w1, Choices.PAPER, { value: weiamount});
      const p2Bal = await p2.getBalance();

      await rps.connect(p1).removeGameP1(p1.address, w1);
      
      await expect((await p2.getBalance()).sub(p2Bal)).to.be.approximately(parseEther("0.19"), parseEther("0.01"));
    })

    it("Should revert if caller isn't the game owner", async function() {
      const { rps } = await loadFixture(deployRps);
      const [p1, p2] = await ethers.getSigners();

      const clearChoice = "2-test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);
      const w1 = 0;

      const weiamount = parseEther("0.1"); /* 0.1 Eth */

      await rps.connect(p1).makeGame(hashedChoice, { value: weiamount });
      await rps.connect(p2).joinGame(p1.address, w1, Choices.PAPER, { value: weiamount});

      await expect(rps.connect(p2).removeGameP1(p1.address, w1)).to.be.revertedWith("crg");
    })
  })

  describe("Concurrency Tests", function() {
    it("Should allow multiple games", async function() {
      const Rps = await ethers.getContractFactory("Rps");
      const rps = await Rps.deploy();

      const [p1, p2] = await ethers.getSigners();
      const gameIndex = 0;
      const p2Choice = Choices.PAPER;

      const clearChoice = Choices.PAPER + "-" + "test";
      const hashedChoice = ethers.utils.soliditySha256(["string"], [clearChoice]);

      const entryFee = ethers.utils.parseEther("0.1");

      for (let i=0; i<100; i++) {
        await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });
      }

      for (let i=0; i<100; i++) {
        await rps.connect(p2).joinGame(p1.address, i, p2Choice, { value: entryFee });
      }

      const p1Bal = await p1.getBalance();
      const p2Bal = await  p2.getBalance();

      for (let i=0; i<100; i++) {
        expect(await rps.connect(p1).resolveGameP1(gameIndex, clearChoice)).to.not.reverted;
      }

      expect(await (await rps.getBalance())).to.be.equal(parseEther("1"));
      expect(await (await p1.getBalance()).sub(p1Bal)).to.be.approximately(parseEther("10"), parseEther("1"));
      expect(await (await p2.getBalance()).sub(p2Bal)).to.be.approximately(parseEther("10"), parseEther("1"));
    })
  })
});
