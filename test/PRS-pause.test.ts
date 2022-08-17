import { expect } from 'chai';
import { ethers } from 'hardhat';
import { CHOICES } from './lib/constants';
import { clearAndHashChoice, deployPaperMock, deployPrs, setupGame } from './lib/helpers';

const pauseRevertMessage = 'Pausable: paused';

describe('PRS-pause', function () {
  describe('startGame', function () {
    it('Should not let players create new games if contract is paused', async function () {
      const { p1, p2, prsMock } = await deployPrs();
      const { paperMock } = await deployPaperMock();
      const entryFee = ethers.utils.parseEther('1');

      const [, hashedChoice] = clearAndHashChoice(CHOICES.PAPER);

      await prsMock.connect(p1).changePaperContract(paperMock.address);
      await paperMock.connect(p1).mint(entryFee);
      await paperMock.connect(p1).approve(prsMock.address, entryFee);
      await prsMock.connect(p1).depositPaper(entryFee);

      await prsMock.connect(p1).pauseGame();

      await expect(prsMock.connect(p1).startGame(hashedChoice, entryFee)).to.revertedWith(
        pauseRevertMessage,
      );
    });
  });

  describe('resolveGame', function () {
    it('Should not let p1 resolve the game if contract is paused', async function () {
      const { clearChoice, hashedChoice, entryFee, gameIndex, p1, p2, prsMock } = await setupGame();
      await prsMock.connect(p2).joinGame(gameIndex, hashedChoice, entryFee);
      await prsMock.connect(p1).pauseGame();

      await expect(prsMock.connect(p1).resolveGame(gameIndex)).to.revertedWith(
        pauseRevertMessage,
      );
    });
  });
  describe('resolveGameP2', function () {
    it("Shouldn't let p2 resolve the game if contract is paused", async function () {
      const { entryFee, gameIndex, p1, p2, prsMock } = await setupGame();
      const [, p2HashedChoice] = clearAndHashChoice(CHOICES.PAPER);

      await prsMock.connect(p2).joinGame(gameIndex, p2HashedChoice, entryFee);
      await prsMock.connect(p1).pauseGame();

      await expect(prsMock.connect(p2).resolveGame(gameIndex)).to.revertedWith(
        pauseRevertMessage,
      );
    });
  });

  describe('joinGame', async function () {
    it("Shouldn't let p2 join a game when contract is paused", async function () {
      const { clearChoice, entryFee, gameIndex, hashedChoice, p1, p2, prsMock } = await setupGame();
      await prsMock.connect(p1).pauseGame();

      await expect(
        prsMock.connect(p2).joinGame(gameIndex, hashedChoice, entryFee),
      ).to.revertedWith(pauseRevertMessage);
    });
  });

  describe('unpause', async function () {
    it('Should unpause the contract after a pause', async function () {
      const { clearChoice, entryFee, gameIndex, hashedChoice, p1, p2, prsMock } = await setupGame();

      await prsMock.connect(p1).pauseGame();
      await expect(await prsMock.connect(p1).paused()).to.equal(true);

      await prsMock.connect(p1).unpauseGame();
      await expect(await prsMock.connect(p1).paused()).to.equal(false);
    });
  });

    describe('withdraw', async function () {
        it('Should not allow withdrawing when contract is paused', async function () {
            const { clearChoice, entryFee, gameIndex, hashedChoice, p1, p2, prsMock, paperMock } = await setupGame();
            await prsMock.connect(p1).pauseGame();

            await paperMock.connect(p1).mintTo(prsMock.address, entryFee);

            await expect(prsMock.connect(p2).withdraw(entryFee)).to.revertedWith(pauseRevertMessage);
        })
    })
});
