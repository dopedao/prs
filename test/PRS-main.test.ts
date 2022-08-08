import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { Contract, Signer } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers, network, deployments } from 'hardhat';
import { ERRORS, CHOICES } from './lib/constants';
import { deployPrs, setupGame } from './lib/helpers';
import { getRandomNumber } from './lib/utils';

describe('PRS-main', function() {
  describe('makeGame', function() {
    it('Should create a game', async function() {
      const { prs, p1 } = await deployPrs();

      const clearChoice = '2-test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      const weiAmount = ethers.BigNumber.from('100000000000000000'); /* 0.1 Eth */

      await prs.connect(p1).makeGame(hashedChoice, { value: weiAmount });
      const game = await prs.connect(p1).getGame(p1.address, 0);

      expect(game.p1SaltedChoice).to.equal(hashedChoice);
      expect(game.entryFee).to.equal(weiAmount);
    });

    it('Should revert on entryFee below minimum', async function() {
      const { prs, p1 } = await deployPrs();

      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      const weiAmount = ethers.BigNumber.from('900000000000000'); /* 0.09 Eth */

      await expect(prs.connect(p1).makeGame(hashedChoice, { value: weiAmount })).to.be.revertedWith(
        ERRORS.AmountTooLow,
      );
    });
  });

  describe('joinGame', function() {
    it('Should let p2 join the game', async function() {
      const { prs, p1, entryFee } = await setupGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 0;

      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
      const game = await prs.connect(p1).getGame(p1.address, gameIndex);

      expect(game.p2).to.equal(p2.address);
      expect(game.p2).to.equal(p2.address);
      expect(game.p2Choice).to.equal(p2Choice);
    });

    it('Should revert on too few tokens sent by p2', async function() {
      const { prs, p1 } = await setupGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 0;

      await expect(
        prs
          .connect(p2)
          .joinGame(p1.address, gameIndex, p2Choice, { value: ethers.BigNumber.from('100000000') }),
      ).to.be.revertedWith(ERRORS.AmountTooLow);
    });

    it('Should revert on index out of bounds p2', async function() {
      const { prs, p1, entryFee } = await setupGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 1;

      await expect(
        prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee }),
      ).to.be.revertedWith(ERRORS.IndexOutOfBounds);
    });

    it('Should revert on player joining his own game', async function() {
      const { prs, p1, entryFee } = await setupGame();
      const p1Choice = CHOICES.PAPER;
      const gameIndex = 0;

      await expect(
        prs.connect(p1).joinGame(p1.address, gameIndex, p1Choice, { value: entryFee }),
      ).to.be.revertedWith(ERRORS.CannotJoinGame);
    });

    it('Should revert if game already has a second player', async function() {
      const { prs, p1, entryFee } = await setupGame();
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

  describe('getHashChoice', function() {
    it('Should return Scissors', async function() {
      const { prs, p1 } = await deployPrs();
      const choice = CHOICES.SCISSORS;

      const clearChoice = `${choice}-test`;
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      await expect(await prs.connect(p1).getHashChoiceMock(hashedChoice, clearChoice)).to.equal(choice);
    });

    it('Should return Paper', async function() {
      const { prs, p1 } = await deployPrs();
      const choice = CHOICES.PAPER;

      const clearChoice = `${choice}-test`;
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      await expect(await prs.connect(p1).getHashChoiceMock(hashedChoice, clearChoice)).to.equal(choice);
    });

    it('Should return Rock', async function() {
      const { prs, p1 } = await deployPrs();
      const choice = CHOICES.ROCK;

      const clearChoice = `${choice}-test`;
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      await expect(await prs.connect(p1).getHashChoiceMock(hashedChoice, clearChoice)).to.equal(choice);
    });
  });

  describe('chooseWinner', function() {
    it('Should pay p1 when paper and rock', async function() {
      const { prs, p1, p2 } = await deployPrs();

      const p1Choice = CHOICES.PAPER;
      const p2Choice = CHOICES.ROCK;
      const entryFee = parseEther('0.1');

      await p1.sendTransaction({
        to: prs.address,
        value: entryFee.mul(2),
      });

      const p1Bal = await p1.getBalance();
      await prs.connect(p1).chooseWinnerMock(p1Choice, p2Choice, p1.address, p2.address, entryFee);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(
        entryFee.mul(2),
        parseEther('0.05'),
      );
    });

    it('Should pay p1 when rock and scissors', async function() {
      const { prs, p1, p2 } = await deployPrs();

      const p1Choice = CHOICES.ROCK;
      const p2Choice = CHOICES.SCISSORS;
      const entryFee = parseEther('0.1');

      await p1.sendTransaction({
        to: prs.address,
        value: entryFee.mul(2),
      });

      const p1Bal = await p1.getBalance();
      await prs.connect(p1).chooseWinnerMock(p1Choice, p2Choice, p1.address, p2.address, entryFee);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(
        entryFee.mul(2),
        parseEther('0.05'),
      );
    });

    it('Should pay p1 when scissors and paper', async function() {
      const { prs, p1, p2 } = await deployPrs();

      const p1Choice = CHOICES.SCISSORS;
      const p2Choice = CHOICES.PAPER;
      const entryFee = parseEther('0.1');

      await p1.sendTransaction({
        to: prs.address,
        value: entryFee.mul(2),
      });

      const p1Bal = await p1.getBalance();
      await prs.connect(p1).chooseWinnerMock(p1Choice, p2Choice, p1.address, p2.address, entryFee);

      await expect(await (await p1.getBalance()).sub(p1Bal)).to.approximately(
        entryFee.mul(2),
        parseEther('0.05'),
      );
    });

    it('Should pay both players when p1==p2', async function() {
      const { prs, p1, p2 } = await deployPrs();

      const p1Choice = CHOICES.PAPER;
      const p2Choice = CHOICES.PAPER;
      const entryFee = parseEther('0.1');

      await p1.sendTransaction({
        to: prs.address,
        value: entryFee.mul(2),
      });

      const p1Bal = await p1.getBalance();
      const p2Bal = await p2.getBalance();
      await prs.connect(p1).chooseWinnerMock(p1Choice, p2Choice, p1.address, p2.address, entryFee);

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

});
