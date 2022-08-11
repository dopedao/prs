import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers, network } from 'hardhat';
import { ERRORS, CHOICES } from './lib/constants';
import { clearAndHashChoice, deployPrs, setupGame } from './lib/helpers';

describe('PRS-resolution', function () {
  describe('resolveGameP1', function () {
    it('Should revert on index out of bounds', async function () {
      const { clearChoice, entryFee, gameIndex, hashedChoice, p1, p2, prsMock } = await setupGame();
      const [, p2HashChoice] = clearAndHashChoice(CHOICES.PAPER);

      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2HashChoice, entryFee);

      const outOfBoundsIndex = 1;

      await expect(prsMock.connect(p1).resolveGame(p1.address, outOfBoundsIndex))
        .to.be.revertedWithCustomError(prsMock, ERRORS.IndexOutOfBounds)
        .withArgs(outOfBoundsIndex);
    });

    it('Should revert if game does not have a second player', async function () {
      const { prsMock, p1, clearChoice } = await setupGame();

      await expect(prsMock.connect(p1).resolveGame(p1.address, 0)).to.be.revertedWithCustomError(
        prsMock,
        ERRORS.NoSecondPlayer,
      );
    });

    it('Should let p1 resolve the game', async function () {
      const { clearChoice, entryFee, gameIndex, p1, p2, prsMock } = await setupGame();
      const [p2ChoicePw, p2HashChoice] = clearAndHashChoice(CHOICES.PAPER);

      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2HashChoice, entryFee);
      await prsMock.connect(p1).revealChoice(p1.address, 0, clearChoice);
      await prsMock.connect(p2).revealChoice(p1.address, 0, p2ChoicePw);

      await expect(await prsMock.connect(p1).resolveGame(p1.address, 0)).to.not.reverted;
    });

    it("Shouldn't let p1 resolve the game if doesn't have one", async function () {
      const { prsMock, p1 } = await deployPrs();
      const gameIndex = 0;

      await expect(prsMock.connect(p1).resolveGame(p1.address, 0))
        .to.be.revertedWithCustomError(prsMock, ERRORS.IndexOutOfBounds)
        .withArgs(gameIndex);
    });
  });

  describe('resolveGame', function () {
    it("Shouldn't let p2 resolve the game if timer is still running", async function () {
      const { entryFee, gameIndex, p1, p2, prsMock } = await setupGame();
      const [, p2HashChoice] = clearAndHashChoice(CHOICES.PAPER);

      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2HashChoice, entryFee);

      await expect(
        prsMock.connect(p2).resolveGame(p1.address, gameIndex),
      ).to.revertedWithCustomError(prsMock, ERRORS.NotResolvable);
    });

    it("Shouldn't let anyone resolve the game if game doesn't have a second player", async function () {
      const { gameIndex, p1, p2, prsMock } = await setupGame();
      const [someRando] = await ethers.getSigners();

      await expect(
        prsMock.connect(someRando).resolveGame(p1.address, gameIndex),
      ).to.revertedWithCustomError(prsMock, ERRORS.NoSecondPlayer);
    });

    it('Should clean up after a tie', async function () {
      const { clearChoice, entryFee, gameIndex, p1, p2, prsMock } = await setupGame();
      const [p2ChoicePw, p2HashChoice] = clearAndHashChoice(CHOICES.PAPER);

      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2HashChoice, entryFee);

      await prsMock.connect(p1).revealChoice(p1.address, gameIndex, clearChoice);
      await prsMock.connect(p2).revealChoice(p1.address, gameIndex, p2ChoicePw);

      await prsMock.connect(p1).resolveGame(p1.address, gameIndex);

      // const game = await prsMock.connect(p1).getGame(p1.address, gameIndex);
      // Game is a tie
    });

    it('Resolves game in favor of p2 if p1 does not reveal no matter the outcome', async function () {
      // Non-standard game setup with 5 eth
      const newEntryFee = '5';
      const { entryFee, gameIndex, p1, p2, prsMock } = await setupGame(newEntryFee);

      // This choice should make p2 a loser
      const [p2ChoicePw, p2HashChoice] = clearAndHashChoice(CHOICES.ROCK);
      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2HashChoice, entryFee);
      await prsMock.connect(p2).revealChoice(p1.address, gameIndex, p2ChoicePw);

      // P1 does not reveal their move within allotted time
      const revealTimeout = await prsMock.revealTimeout();
      await network.provider.send('evm_increaseTime', [revealTimeout.toNumber()]);
      await network.provider.send('evm_mine');

      // P2 still claims victory so P1 can't grief
      await prsMock.connect(p2).resolveGame(p1.address, gameIndex);

      const p2EndBal = await prsMock.balanceOf(p2.address);
      const bigIntNewEntryFee = parseEther(newEntryFee);
      const TAX = await prsMock.taxPercent();
      const totalTax = bigIntNewEntryFee.mul(2).div(100).mul(TAX);
      const expectedP2Bal = bigIntNewEntryFee.mul(2).sub(totalTax);

      // console.log(ethers.utils.formatEther(totalTax));
      // console.log(ethers.utils.formatEther(expectedP2Bal));

      await expect(p2EndBal).to.be.approximately(expectedP2Bal, parseEther('0.001'));
    });

    it('Resolves game in favor of p1 if p2 does not reveal no matter the outcome', async function () {
      // Non-standard game setup with 5 eth
      const newEntryFee = '5';
      const { entryFee, gameIndex, p1, p2, prsMock, clearChoice } = await setupGame(newEntryFee);

      // This choice should make p2 a loser
      const [, p2HashChoice] = clearAndHashChoice(CHOICES.ROCK);
      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2HashChoice, entryFee);
      await prsMock.connect(p1).revealChoice(p1.address, gameIndex, clearChoice);

      // P2 does not reveal their move within allotted time
      const revealTimeout = await prsMock.revealTimeout();
      await network.provider.send('evm_increaseTime', [revealTimeout.toNumber()]);
      await network.provider.send('evm_mine');

      // P1 still claims victory so P2 can't grief
      await prsMock.connect(p1).resolveGame(p1.address, gameIndex);

      const p1EndBal = await prsMock.balanceOf(p1.address);
      const bigIntNewEntryFee = parseEther(newEntryFee);
      const TAX = await prsMock.taxPercent();
      const totalTax = bigIntNewEntryFee.mul(2).div(100).mul(TAX);
      const expectedP1Bal = bigIntNewEntryFee.mul(2).sub(totalTax);

      // console.log(ethers.utils.formatEther(totalTax));
      // console.log(ethers.utils.formatEther(expectedP2Bal));

      await expect(p1EndBal).to.be.approximately(expectedP1Bal, parseEther('0.001'));
    });

    it('Should prevent a game from being resolved and paid multiple times', async function() {
      const { clearChoice, entryFee, gameIndex, p1, p2, prsMock } = await setupGame();
      const [p2ChoicePw, p2HashChoice] = clearAndHashChoice(CHOICES.PAPER);

      await prsMock.connect(p2).joinGame(p1.address, gameIndex, p2HashChoice, entryFee);
      await prsMock.connect(p1).revealChoice(p1.address, 0, clearChoice);
      await prsMock.connect(p2).revealChoice(p1.address, 0, p2ChoicePw);

      await prsMock.connect(p1).resolveGame(p1.address, 0);
      await expect(prsMock.connect(p1).resolveGame(p1.address, 0)).to.revertedWithCustomError(
        prsMock,
        ERRORS.NotResolvable
      ).withArgs(false, false, false, true);
    });
  });
});
