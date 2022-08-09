import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ERRORS, CHOICES } from './lib/constants';
import { deployPrs, setupGame } from './lib/helpers';

describe('PRS-main', function () {
  describe('startGame', function () {
    it('Creates a game', async function () {
      const { prsMock, p1 } = await deployPrs();

      const clearChoice = '2-test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      const weiAmount = ethers.utils.parseEther('0.1');
      await p1.sendTransaction({ to: prsMock.address, value: weiAmount });
      await prsMock.connect(p1).startGame(hashedChoice, weiAmount);
      const game = await prsMock.connect(p1).getGame(p1.address, 0);

      expect(game.p1SaltedChoice).to.equal(hashedChoice);
      expect(game.entryFee).to.equal(weiAmount);
    });

    it('Reverts on entryFee below minimum', async function () {
      const { prsMock, p1 } = await setupGame();

      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);
      const minEntryFee = await prsMock.minEntryFee();

      const weiAmount = ethers.BigNumber.from('900000000000000'); /* 0.09 Eth */

      await expect(prsMock.connect(p1).startGame(hashedChoice, weiAmount))
        .to.be.revertedWithCustomError(prsMock, ERRORS.AmountTooLow)
        .withArgs(weiAmount, minEntryFee);
    });
  });

  describe('joinGame', function () {
    it('Allows p2 to join the game', async function () {
      const { prsMock, p1, entryFee } = await setupGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 0;

      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2Choice, entryFee);
      const game = await prsMock.connect(p1).getGame(p1.address, gameIndex);

      expect(game.p2).to.equal(p2.address);
      expect(game.p2).to.equal(p2.address);
      expect(game.p2Choice).to.equal(p2Choice);
    });

    it('Reverts on too low of an entryFee', async function () {
      const { prsMock, p1, entryFee } = await setupGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 0;
      const p2WeiAmount = ethers.utils.parseEther('0.0001');

      await expect(prsMock.connect(p2).joinGame(p1.address, gameIndex, p2Choice, p2WeiAmount))
        .to.be.revertedWithCustomError(prsMock, ERRORS.AmountTooLow)
        .withArgs(p2WeiAmount, entryFee);
    });

    it('Reverts on index out of bounds p2', async function () {
      const { prsMock, p1, entryFee } = await setupGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 1;

      await expect(prsMock.connect(p2).joinGame(p1.address, gameIndex, p2Choice, entryFee))
        .to.be.revertedWithCustomError(prsMock, ERRORS.IndexOutOfBounds)
        .withArgs(gameIndex);
    });

    it('Prevents player joining his own game', async function () {
      const { prsMock, p1, entryFee } = await setupGame();
      const p1Choice = CHOICES.PAPER;
      const gameIndex = 0;
      // Need enough to join twice
      await p1.sendTransaction({ to: prsMock.address, value: ethers.utils.parseEther('5') });
      await expect(prsMock.connect(p1).joinGame(p1.address, gameIndex, p1Choice, entryFee))
        .to.be.revertedWithCustomError(prsMock, ERRORS.CannotJoinGame)
        .withArgs(false, true);
    });

    it('Reverts if game already has a second player', async function () {
      const { prsMock, p1, entryFee } = await setupGame();
      const [_, p2, p3] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const p3Choice = CHOICES.ROCK;
      const gameIndex = 0;

      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2Choice, entryFee);

      await p3.sendTransaction({ to: prsMock.address, value: ethers.utils.parseEther('1') });
      await expect(prsMock.connect(p3).joinGame(p1.address, gameIndex, p3Choice, entryFee))
        .to.be.revertedWithCustomError(prsMock, ERRORS.CannotJoinGame)
        .withArgs(true, false);
    });
  });
});
