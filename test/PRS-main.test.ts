import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ERRORS, CHOICES } from './lib/constants';
import { clearAndHashChoice, deployPaperMock, deployPrs, setupGame } from './lib/helpers';

describe('PRS-main', function () {

  describe('revealTimeout', function() {
    it('Allows owner to set it', async function () {
      const { prsMock, p1, p2 } = await deployPrs();
      const newTimeout = 60*1000; // 60 seconds
      const defaultTimeout = await prsMock.revealTimeout(); // 12 hours
      expect(defaultTimeout).to.not.equal(newTimeout);

      await prsMock.connect(p1).setRevealTimeout(newTimeout);
      const updatedTimeout = await prsMock.revealTimeout();
      expect(updatedTimeout).to.equal(newTimeout);
    });
    it('Prevents anyone else from setting', async function () {
      const { prsMock, p1, p2 } = await deployPrs();
      await expect(prsMock.connect(p2).setRevealTimeout(60*1000)).
        to.be.reverted;
    });

  });

  describe('startGame', function () {
    it('Creates a game', async function () {
      const { prsMock, p1 } = await deployPrs();
      const { paperMock } = await deployPaperMock();
      const [, hashedChoice] = clearAndHashChoice(CHOICES.PAPER)

      const paperAmount = ethers.utils.parseEther('0.1');

      await paperMock.connect(p1).mint(paperAmount);
      await prsMock.connect(p1).changePaperContract(paperMock.address)
      await paperMock.connect(p1).approve(prsMock.address, paperAmount);
      await prsMock.connect(p1).depositPaper(paperAmount);

      await prsMock.connect(p1).startGame(hashedChoice, paperAmount);
      const game = await prsMock.connect(p1).getGame(0);

      expect(game.p1).to.equal(p1.address);
      expect(game.p1SaltedChoice).to.equal(hashedChoice);
      expect(game.entryFee).to.equal(paperAmount);
    });

    it('Reverts on entryFee below minimum', async function () {
      const { prsMock, p1 } = await setupGame();
      const [, hashedChoice] = clearAndHashChoice(CHOICES.PAPER)

      const minEntryFee = await prsMock.minEntryFee();
      const paperAmount = ethers.BigNumber.from('900000000000000'); /* 0.09 Eth */

      await expect(prsMock.connect(p1).startGame(hashedChoice, paperAmount))
        .to.be.revertedWithCustomError(prsMock, ERRORS.AmountTooLow)
        .withArgs(paperAmount, minEntryFee);
    });
  });

  describe('joinGame', function () {
    it('Allows p2 to join the game', async function () {
      const { prsMock, p1, entryFee, paperMock } = await setupGame();
      const [, p2] = await ethers.getSigners();
      const [p2ClearChoice, p2HashedChoice] = clearAndHashChoice(CHOICES.PAPER)
      const gameIndex = 0;

      await prsMock.connect(p2).joinGame(gameIndex, p2HashedChoice, entryFee);

      //p2 reveals
      await prsMock.connect(p2).revealChoice(gameIndex, p2ClearChoice);
      const game = await prsMock.connect(p1).getGame(gameIndex);

      expect(game.p1).to.equal(p1.address);
      expect(game.p2).to.equal(p2.address);
      expect(game.p2ClearChoice).to.equal(CHOICES.PAPER);
    });

    it('Reverts on too low of an entryFee', async function () {
      const { prsMock, p1, entryFee } = await setupGame();
      const [, p2] = await ethers.getSigners();
      const [, p2HashedChoice] = clearAndHashChoice(CHOICES.PAPER)
      const gameIndex = 0;
      const p2WeiAmount = ethers.utils.parseEther('0.0001');

      await expect(prsMock.connect(p2).joinGame(gameIndex, p2HashedChoice, p2WeiAmount))
        .to.be.revertedWithCustomError(prsMock, ERRORS.AmountTooLow)
        .withArgs(p2WeiAmount, entryFee);
    });

    it('Reverts on index out of bounds p2', async function () {
      const { prsMock, p1, entryFee } = await setupGame();
      const [, p2] = await ethers.getSigners();
      const [, p2HashedChoice] = clearAndHashChoice(CHOICES.PAPER)
      const gameIndex = 1;

      await expect(prsMock.connect(p2).joinGame(gameIndex, p2HashedChoice, entryFee))
        .to.be.revertedWithCustomError(prsMock, ERRORS.IndexOutOfBounds)
        .withArgs(gameIndex);
    });

    it('Prevents player joining his own game', async function () {
      const { prsMock, p1, entryFee, paperMock } = await setupGame();
      const [, p1HashedChoice] = clearAndHashChoice(CHOICES.PAPER)
      const gameIndex = 0;
      
      // Need enough to join twice
      await paperMock.connect(p1).mint(entryFee);
      await paperMock.connect(p1).approve(prsMock.address, entryFee.mul(2));
      await prsMock.connect(p1).depositPaper(entryFee);

      await expect(prsMock.connect(p1).joinGame(gameIndex, p1HashedChoice, entryFee))
        .to.be.revertedWithCustomError(prsMock, ERRORS.CannotJoinGame)
        .withArgs(false, true);
    });

    it('Reverts if game already has a second player', async function () {
      const { prsMock, p1, entryFee, paperMock } = await setupGame();
      const [, p2, p3] = await ethers.getSigners();
      const [, p2HashedChoice] = clearAndHashChoice(CHOICES.PAPER)
      const [, p3HashedChoice] = clearAndHashChoice(CHOICES.ROCK);

      const gameIndex = 0;

      // p2
      await paperMock.connect(p2).mint(entryFee);
      await paperMock.connect(p2).approve(prsMock.address, entryFee.mul(2));
      await prsMock.connect(p2).depositPaper(entryFee);
      
      // p3
      await paperMock.connect(p3).mint(entryFee);
      await paperMock.connect(p3).approve(prsMock.address, entryFee.mul(2));
      await prsMock.connect(p3).depositPaper(entryFee);

      await prsMock.connect(p2).joinGame(gameIndex, p2HashedChoice, entryFee);
      await expect(prsMock.connect(p3).joinGame(gameIndex, p3HashedChoice, entryFee))
        .to.be.revertedWithCustomError(prsMock, ERRORS.CannotJoinGame)
        .withArgs(true, false);
    });
  });
});
