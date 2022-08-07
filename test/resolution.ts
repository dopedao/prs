import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers, network, deployments } from 'hardhat';
import { ERRORS, CHOICES } from './lib/constants';
import { deployPrs, createGame } from './lib/helpers';

describe('PRS-resolution', function () {

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


});
