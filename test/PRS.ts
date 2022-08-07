import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { Contract, Signer } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers, network, deployments } from 'hardhat';
import { ERRORS, CHOICES } from './constants';
import { deployPrs, createGame } from './fixtures';

describe('PAPER, Rock, Scissors', function () {

  describe('makeGame', function () {
    it('Should create a game', async function () {
      const {prs, p1} = await deployPrs();

      const clearChoice = '2-test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      const weiAmount = ethers.BigNumber.from('100000000000000000'); /* 0.1 Eth */

      await prs.connect(p1).makeGame(hashedChoice, { value: weiAmount });
      const game = await prs.connect(p1).getGame(p1.address, 0);

      expect(game.p1SaltedChoice).to.equal(hashedChoice);
      expect(game.entryFee).to.equal(weiAmount);
    });

    it('Should revert on entryFee below minimum', async function () {
      const {prs, p1} = await deployPrs();
      
      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      const weiAmount = ethers.BigNumber.from('900000000000000'); /* 0.09 Eth */

      await expect(prs.connect(p1).makeGame(hashedChoice, { value: weiAmount })).to.be.revertedWith(
        ERRORS.AmountTooLow,
      );
    });
  });

  describe('joinGame', function () {
    it('Should let p2 join the game', async function () {
      const { prs, p1, entryFee } = await createGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 0;

      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
      const game = await prs.connect(p1).getGame(p1.address, gameIndex);

      expect(game.p2).to.equal(p2.address);
      expect(game.p2).to.equal(p2.address);
      expect(game.p2Choice).to.equal(p2Choice);
    });

    it('Should revert on too few tokens sent by p2', async function () {
      const { prs, p1 } = await createGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 0;

      await expect(
        prs
          .connect(p2)
          .joinGame(p1.address, gameIndex, p2Choice, { value: ethers.BigNumber.from('100000000') }),
      ).to.be.revertedWith(ERRORS.AmountTooLow);
    });

    it('Should revert on index out of bounds p2', async function () {
      const { prs, p1, entryFee } = await createGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 1;

      await expect(
        prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee }),
      ).to.be.revertedWith(ERRORS.IndexOutOfBounds);
    });

    it('Should revert on player joining his own game', async function () {
      const { prs, p1, entryFee } = await createGame();
      const p1Choice = CHOICES.PAPER;
      const gameIndex = 0;

      await expect(
        prs.connect(p1).joinGame(p1.address, gameIndex, p1Choice, { value: entryFee }),
      ).to.be.revertedWith(ERRORS.CannotJoinGame);
    });

    it('Should revert if game already has a second player', async function () {
      const { prs, p1, entryFee } = await createGame();
      const [_, p2, p3] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const p3Choice = CHOICES.ROCK;
      const gameIndex = 0;

      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
      await expect(
        prs.connect(p3).joinGame(p1.address, gameIndex, p3Choice, { value: entryFee }),
      ).to.be.revertedWith(ERRORS.CannotJoinGame);
    });
  });

  describe('resolveGameP1', function () {
    it('Should revert on index out of bounds', async function () {
      const { prs, p1, clearChoice, entryFee } = await createGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 0;

      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });

      const oufOfBoundsIndex = 1;

      await expect(prs.connect(p1).resolveGameP1(oufOfBoundsIndex, clearChoice)).to.be.revertedWith(
        ERRORS.IndexOutOfBounds,
      );
    });

    it('Should revert if game does not have a second player', async function () {
      const { prs, p1, clearChoice } = await createGame();

      await expect(prs.connect(p1).resolveGameP1(0, clearChoice)).to.be.revertedWith(
        ERRORS.NoSecondPlayer,
      );
    });

    it('Should let p1 resolve the game', async function () {
      const { prs, p1, clearChoice, entryFee } = await createGame();
      const [_, p2] = await ethers.getSigners();
      const gameIndex = 0;
      const p2Choice = CHOICES.PAPER;
      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });

      await expect(await prs.connect(p1).resolveGameP1(gameIndex, clearChoice)).to.not.reverted;
    });

    it("Shouldn't let p1 resolve the game if doesn't have one", async function () {
      const { prs, p1 } = await deployPrs();
      const gameIndex = 0;
      const gameClearChoice = 'test';

      await expect(prs.connect(p1).resolveGameP1(gameIndex, gameClearChoice)).to.be.revertedWith(
        ERRORS.IndexOutOfBounds,
      );
    });
  });

  describe('resolveGameP2', function () {
    it("Shouldn't let p2 resolve the game if timer is still running", async function () {
      const PRS = await ethers.getContractFactory('PRS');
      const prs = await PRS.deploy();

      const [p1] = await ethers.getSigners();

      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      const entryFee = ethers.utils.parseEther('0.1'); /* 0.1 Eth */

      await prs.connect(p1).makeGame(hashedChoice, { value: entryFee });

      const [_, p2] = await ethers.getSigners();
      const gameIndex = 0;
      const p2Choice = CHOICES.PAPER;

      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });

      await expect(prs.connect(p2).resolveGameP2(p1.address, gameIndex)).to.revertedWith(
        ERRORS.TimerStillRunning,
      );
    });

    it("Shouldn't let p2 resolve the game if game doesn't have a second player", async function () {
      const PRS = await ethers.getContractFactory('PRS');
      const prs = await PRS.deploy();

      const [p1] = await ethers.getSigners();

      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      const entryFee = ethers.utils.parseEther('0.1'); /* 0.1 Eth */

      await prs.connect(p1).makeGame(hashedChoice, { value: entryFee });

      const [_, p2] = await ethers.getSigners();
      const gameIndex = 0;

      await expect(prs.connect(p2).resolveGameP2(p1.address, gameIndex)).to.revertedWith(
        ERRORS.NoSecondPlayer,
      );
    });

    it('Should clean up after resolve', async function () {
      const PRS = await ethers.getContractFactory('PRS');
      const prs = await PRS.deploy();

      const [p1] = await ethers.getSigners();

      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      const entryFee = ethers.utils.parseEther('0.1'); /* 0.1 Eth */

      await prs.connect(p1).makeGame(hashedChoice, { value: entryFee });
      const [_, p2] = await ethers.getSigners();
      const gameIndex = 0;
      const p2Choice = CHOICES.PAPER;
      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
      await prs.connect(p1).resolveGameP1(gameIndex, clearChoice);

      await expect(prs.connect(p1).getGame(p1.address, gameIndex)).to.be.revertedWith(
        ERRORS.IndexOutOfBounds,
      );
    });

    it('Should let p2 resolve the game if the timer ran out', async function () {
      const PRS = await ethers.getContractFactory('PRS');
      const prs = await PRS.deploy();

      const [p1] = await ethers.getSigners();

      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      const entryFee = ethers.utils.parseEther('0.1'); /* 0.1 Eth */
      const revealTimeout = await prs.REVEAL_TIMEOUT();

      await prs.connect(p1).makeGame(hashedChoice, { value: entryFee });
      const [_, p2] = await ethers.getSigners();
      const gameIndex = 0;

      const p2Choice = CHOICES.PAPER;
      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });

      await network.provider.send('evm_increaseTime', [revealTimeout]);
      await network.provider.send('evm_mine');

      const p2Bal = await p2.getBalance();
      await prs.connect(p2).resolveGameP2(p1.address, gameIndex);

      await expect((await p2.getBalance()).sub(p2Bal)).to.be.approximately(
        parseEther('0.19'),
        parseEther('0.01'),
      );
      await expect(prs.connect(p1).getGame(p1.address, gameIndex)).to.be.revertedWith(
        ERRORS.IndexOutOfBounds,
      );
    });
  });

  describe('getHashChoice', function () {
    it('Should return Scissors', async function () {
      const { prs, p1 } = await deployPrs();
      const choice = CHOICES.SCISSORS;

      const clearChoice = `${choice}-test`;
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      await expect(await prs.connect(p1).getHashChoice(hashedChoice, clearChoice)).to.equal(choice);
    });

    it('Should return Paper', async function () {
      const { prs, p1 } = await deployPrs();
      const choice = CHOICES.PAPER;

      const clearChoice = `${choice}-test`;
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      await expect(await prs.connect(p1).getHashChoice(hashedChoice, clearChoice)).to.equal(choice);
    });

    it('Should return Rock', async function () {
      const { prs, p1 } = await deployPrs();
      const choice = CHOICES.ROCK;

      const clearChoice = `${choice}-test`;
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      await expect(await prs.connect(p1).getHashChoice(hashedChoice, clearChoice)).to.equal(choice);
    });
  });

  describe('chooseWinner', function () {
    it('Should pay p1 when paper and rock', async function () {
      const { prs, p1, p2 } = await deployPrs();

      const p1Choice = CHOICES.PAPER;
      const p2Choice = CHOICES.ROCK;
      const entryFee = parseEther('0.1');
      await prs.connect(p1).rcv({ value: entryFee.mul(2) });

      const p1Bal = await p1.getBalance();
      await prs.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, entryFee);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(
        entryFee.mul(2),
        parseEther('0.05'),
      );
    });

    it('Should pay p1 when rock and scissors', async function () {
      const { prs, p1, p2 } = await deployPrs();

      const p1Choice = CHOICES.ROCK;
      const p2Choice = CHOICES.SCISSORS;
      const entryFee = parseEther('0.1');
      await prs.connect(p1).rcv({ value: entryFee.mul(2) });

      const p1Bal = await p1.getBalance();
      await prs.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, entryFee);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(
        entryFee.mul(2),
        parseEther('0.05'),
      );
    });

    it('Should pay p1 when scissors and paper', async function () {
      const { prs, p1, p2 } = await deployPrs();

      const p1Choice = CHOICES.SCISSORS;
      const p2Choice = CHOICES.PAPER;
      const entryFee = parseEther('0.1');
      await prs.connect(p1).rcv({ value: entryFee.mul(2) });

      const p1Bal = await p1.getBalance();
      await prs.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, entryFee);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(
        entryFee.mul(2),
        parseEther('0.05'),
      );
    });

    it('Should pay both players when p1==p2', async function () {
      const { prs, p1, p2 } = await deployPrs();

      const p1Choice = CHOICES.PAPER;
      const p2Choice = CHOICES.PAPER;
      const entryFee = parseEther('0.1');
      await prs.connect(p1).rcv({ value: entryFee.mul(2) });

      const p1Bal = await p1.getBalance();
      const p2Bal = await p2.getBalance();
      await prs.connect(p1).chooseWinner(p1Choice, p2Choice, p1.address, p2.address, entryFee);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(
        entryFee,
        parseEther('0.008'),
      );
      await expect(await (await p2.getBalance()).sub(p2Bal)).to.approximately(
        entryFee,
        parseEther('0.008'),
      );
    });
  });

  describe('payoutWithAppliedTax', function () {
    it("Should revert if contract doesn't have enough tokens", async function () {
      const { prs, p1 } = await deployPrs();
      const entryFee = ethers.utils.parseEther('1');

      await expect(prs.payoutWithAppliedTax(p1.address, entryFee)).to.revertedWith(
        ERRORS.NotEnoughMoneyInContract,
      );
    });

    it('Should apply tax', async function () {
      const { prs, p1 } = await deployPrs();

      const initialEntryFee = ethers.utils.parseEther('0.5');
      const TAX = await await prs.TAX_PERCENT();

      const payout = initialEntryFee.mul(2).sub(initialEntryFee.mul(2).div(100).mul(TAX));
      const expectedBal = initialEntryFee.mul(2).sub(payout);

      await prs.connect(p1).rcv({ value: initialEntryFee.mul(2) });
      await prs.payoutWithAppliedTax(p1.address, initialEntryFee);

      await expect(await prs.getBalance()).to.equal(expectedBal);
    });
  });

  describe('removeGame', function () {
    it('Should remove a game and update its position', async function () {
      const { prs, p1 } = await deployPrs();

      const clearChoice = '2-test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);
      const w1 = 0;

      const weiAmount = parseEther('0.1'); /* 0.1 Eth */
      const weiAmount2 = parseEther('0.2'); /* 0.1 Eth */

      await prs.connect(p1).makeGame(hashedChoice, { value: weiAmount });
      await prs.connect(p1).makeGame(hashedChoice, { value: weiAmount2 });

      await prs.connect(p1).removeGameP1(p1.address, w1);

      expect(await (await prs.connect(p1).getGame(p1.address, w1)).entryFee).to.equal(weiAmount2);
    });

    it('Should forfeit if game has p2', async function () {
      const { prs, p1, p2 } = await deployPrs();

      const clearChoice = '2-test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);
      const w1 = 0;

      const weiAmount = parseEther('0.1'); /* 0.1 Eth */

      await prs.connect(p1).makeGame(hashedChoice, { value: weiAmount });
      await prs.connect(p2).joinGame(p1.address, w1, CHOICES.PAPER, { value: weiAmount });
      const p2Bal = await p2.getBalance();

      await prs.connect(p1).removeGameP1(p1.address, w1);

      await expect((await p2.getBalance()).sub(p2Bal)).to.be.approximately(
        parseEther('0.19'),
        parseEther('0.01'),
      );
    });

    it("Should revert if caller isn't the game owner", async function () {
      const { prs, p1, p2 } = await deployPrs();

      const clearChoice = '2-test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);
      const w1 = 0;

      const weiAmount = parseEther('0.1'); /* 0.1 Eth */

      await prs.connect(p1).makeGame(hashedChoice, { value: weiAmount });
      await prs.connect(p2).joinGame(p1.address, w1, CHOICES.PAPER, { value: weiAmount });

      await expect(prs.connect(p2).removeGameP1(p1.address, w1)).to.be.revertedWith(
        ERRORS.CannotRemoveGame,
      );
    });
  });

  describe('Concurrency Tests', function () {
    it('Should allow multiple games', async function () {
      const PRS = await ethers.getContractFactory('PRS');
      const prs = await PRS.deploy();

      const [p1, p2] = await ethers.getSigners();
      const gameIndex = 0;
      const p2Choice = CHOICES.PAPER;

      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      const entryFee = ethers.utils.parseEther('0.1');

      for (let i = 0; i < 100; i++) {
        await prs.connect(p1).makeGame(hashedChoice, { value: entryFee });
      }

      for (let i = 0; i < 100; i++) {
        await prs.connect(p2).joinGame(p1.address, i, p2Choice, { value: entryFee });
      }

      const p1Bal = await p1.getBalance();
      const p2Bal = await p2.getBalance();

      for (let i = 0; i < 100; i++) {
        expect(await prs.connect(p1).resolveGameP1(gameIndex, clearChoice)).to.not.reverted;
      }

      expect(await await prs.getBalance()).to.be.equal(parseEther('1'));
      expect(await (await p1.getBalance()).sub(p1Bal)).to.be.approximately(
        parseEther('10'),
        parseEther('1'),
      );
      expect(await (await p2.getBalance()).sub(p2Bal)).to.be.approximately(
        parseEther('10'),
        parseEther('1'),
      );
    });
  });
});
