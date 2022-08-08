import { expect } from 'chai';
import { ethers } from 'hardhat';
import { ERRORS, CHOICES } from './lib/constants';
import { deployPrs, setupGame } from './lib/helpers';

describe('PRS-main', function() {
  describe('makeGame', function() {
    it('Should create a game', async function() {
      const { prsMock, p1 } = await deployPrs();

      const clearChoice = '2-test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      const weiAmount = ethers.BigNumber.from('100000000000000000'); /* 0.1 Eth */

      await prsMock.connect(p1).makeGame(hashedChoice, { value: weiAmount });
      const game = await prsMock.connect(p1).getGame(p1.address, 0);

      expect(game.p1SaltedChoice).to.equal(hashedChoice);
      expect(game.entryFee).to.equal(weiAmount);
    });

    it('Should revert on entryFee below minimum', async function() {
      const { prsMock, p1 } = await deployPrs();

      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      const weiAmount = ethers.BigNumber.from('900000000000000'); /* 0.09 Eth */

      await expect(prsMock.connect(p1).makeGame(hashedChoice, { value: weiAmount })).to.be.revertedWith(
        ERRORS.AmountTooLow,
      );
    });
  });

  describe('joinGame', function() {
    it('Should let p2 join the game', async function() {
      const { prsMock, p1, entryFee } = await setupGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 0;

      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
      const game = await prsMock.connect(p1).getGame(p1.address, gameIndex);

      expect(game.p2).to.equal(p2.address);
      expect(game.p2).to.equal(p2.address);
      expect(game.p2Choice).to.equal(p2Choice);
    });

    it('Should revert on too few tokens sent by p2', async function() {
      const { prsMock, p1 } = await setupGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 0;

      await expect(
        prsMock
          .connect(p2)
          .joinGame(p1.address, gameIndex, p2Choice, { value: ethers.BigNumber.from('100000000') }),
      ).to.be.revertedWith(ERRORS.AmountTooLow);
    });

    it('Should revert on index out of bounds p2', async function() {
      const { prsMock, p1, entryFee } = await setupGame();
      const [_, p2] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const gameIndex = 1;

      await expect(
        prsMock.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee }),
      ).to.be.revertedWith(ERRORS.IndexOutOfBounds);
    });

    it('Should revert on player joining his own game', async function() {
      const { prsMock, p1, entryFee } = await setupGame();
      const p1Choice = CHOICES.PAPER;
      const gameIndex = 0;

      await expect(
        prsMock.connect(p1).joinGame(p1.address, gameIndex, p1Choice, { value: entryFee }),
      ).to.be.revertedWith(ERRORS.CannotJoinGame);
    });

    it('Should revert if game already has a second player', async function() {
      const { prsMock, p1, entryFee } = await setupGame();
      const [_, p2, p3] = await ethers.getSigners();
      const p2Choice = CHOICES.PAPER;
      const p3Choice = CHOICES.ROCK;
      const gameIndex = 0;

      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
      await expect(
        prsMock.connect(p3).joinGame(p1.address, gameIndex, p3Choice, { value: entryFee }),
      ).to.be.revertedWith(ERRORS.CannotJoinGame);
    });
  });
});
