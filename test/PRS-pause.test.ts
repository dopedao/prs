import { expect } from 'chai';
import { ethers } from 'hardhat';
import { CHOICES } from './lib/constants';
import { deployPrs, setupGame } from './lib/helpers';

const pauseRevertMessage = 'Pausable: paused';

describe('PRS-pause', function () {
  describe('startGame', function () {
    it('Should not let players create new games if contract is paused', async function () {
      const { p1, p2, prsMock } = await deployPrs();
      const entryFee = ethers.utils.parseEther('1');

      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      await p1.sendTransaction({ to: prsMock.address, value: entryFee });
      await prsMock.connect(p1).pauseContract();

      await expect(prsMock.connect(p1).startGame(hashedChoice, entryFee)).to.revertedWith(
        pauseRevertMessage,
      );
    });
  });

  describe('resolveGameP1', function () {
    it('Should not let p1 resolve the game if contract is paused', async function () {
      const { clearChoice, entryFee, gameIndex, p1, p2, prsMock } = await setupGame();

      const p2Choice = CHOICES.PAPER;
      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2Choice, entryFee);
      await prsMock.connect(p1).pauseContract();

      await expect(prsMock.connect(p1).resolveGameP1(gameIndex, clearChoice)).to.revertedWith(
        pauseRevertMessage,
      );
    });
  });
  describe('resolveGameP2', function () {
    it("Shouldn't let p2 resolve the game if contract is paused", async function () {
      const { entryFee, gameIndex, p1, p2, prsMock } = await setupGame();

      const p2Choice = CHOICES.PAPER;
      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2Choice, entryFee);
      await prsMock.connect(p1).pauseContract();

      await expect(prsMock.connect(p2).resolveGameP2(p1.address, gameIndex)).to.revertedWith(
        pauseRevertMessage,
      );
    });
  });

  describe('joinGame', async function () {
    it("Shouldn't let p2 join a game when contract is paused", async function () {
      const { clearChoice, entryFee, gameIndex, hashedChoice, p1, p2, prsMock } = await setupGame();
      await prsMock.connect(p1).pauseContract();

      await expect(
        prsMock.connect(p2).joinGame(p1.address, hashedChoice, gameIndex, entryFee),
      ).to.revertedWith(pauseRevertMessage);
    });
  });

    describe('unpause', async function () {
        it("Should unpause the contract after a pause", async function () {
            const { clearChoice, entryFee, gameIndex, hashedChoice, p1, p2, prsMock } = await setupGame();

            await prsMock.connect(p1).pauseContract();
            await expect(
                await prsMock.connect(p1).contractState()
            ).to.equal(true);

            await prsMock.connect(p1).unpauseContract();
            await expect(
                await prsMock.connect(p1).contractState()
            ).to.equal(false);
        });
    });
});
