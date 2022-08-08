import { expect } from 'chai';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { ethers, network, deployments } from 'hardhat';
import { ERRORS, CHOICES } from './lib/constants';
import { deployPrs, setupGame } from './lib/helpers';

describe('PRS-resolution', function() {
  describe('resolveGameP1', function() {
    it('Should revert on index out of bounds', async function() {
      const { clearChoice, entryFee, gameIndex, hashedChoice, p1, p2, prs } = await setupGame();

      const p2Choice = CHOICES.PAPER;
      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });

      const oufOfBoundsIndex = 1;

      await expect(prs.connect(p1).resolveGameP1(oufOfBoundsIndex, clearChoice)).to.be.revertedWith(
        ERRORS.IndexOutOfBounds,
      );
    });

    it('Should revert if game does not have a second player', async function() {
      const { prs, p1, clearChoice } = await setupGame();

      await expect(prs.connect(p1).resolveGameP1(0, clearChoice)).to.be.revertedWith(
        ERRORS.NoSecondPlayer,
      );
    });

    it('Should let p1 resolve the game', async function() {
      const { clearChoice, entryFee, gameIndex, p1, p2, prs } = await setupGame();

      const p2Choice = CHOICES.PAPER;
      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });

      await expect(await prs.connect(p1).resolveGameP1(gameIndex, clearChoice)).to.not.reverted;
    });

    it("Shouldn't let p1 resolve the game if doesn't have one", async function() {
      const { prs, p1 } = await deployPrs();
      const gameIndex = 0;
      const gameClearChoice = 'test';

      await expect(prs.connect(p1).resolveGameP1(gameIndex, gameClearChoice)).to.be.revertedWith(
        ERRORS.IndexOutOfBounds,
      );
    });
  });

  describe('resolveGameP2', function() {
    it("Shouldn't let p2 resolve the game if timer is still running", async function() {
      const { entryFee, gameIndex, p1, p2, prs } = await setupGame();

      const p2Choice = CHOICES.PAPER;
      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });

      await expect(prs.connect(p2).resolveGameP2(p1.address, gameIndex)).to.revertedWith(
        ERRORS.TimerStillRunning,
      );
    });

    it("Shouldn't let p2 resolve the game if game doesn't have a second player", async function() {
      const { gameIndex, p1, p2, prs } = await setupGame();

      await expect(prs.connect(p2).resolveGameP2(p1.address, gameIndex)).to.revertedWith(
        ERRORS.NoSecondPlayer,
      );
    });

    it('Should clean up after resolve', async function() {
      const { clearChoice, entryFee, gameIndex, p1, p2, prs } = await setupGame();

      const p2Choice = CHOICES.PAPER;
      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });
      await prs.connect(p1).resolveGameP1(gameIndex, clearChoice);

      const idx = await prs.connect(p1).getGame(p1.address, gameIndex);
    });

    it('Should resolve game with proper winner when p2 calls resolveGame', async function() {
      // Non-standard game setup with 5 eth
      const newEntryFee = '5';
      const { entryFee, gameIndex, p1, p2, prs } = await setupGame(newEntryFee);

      const p2StartBal = await p2.getBalance();

      // This choice should make p2 a loser
      const p2Choice = CHOICES.ROCK;
      await prs.connect(p2).joinGame(p1.address, gameIndex, p2Choice, { value: entryFee });

      const revealTimeout = await prs.REVEAL_TIMEOUT();
      await network.provider.send('evm_increaseTime', [revealTimeout]);
      await network.provider.send('evm_mine');


      // Make sure P2 is a loser by checking balance after the fact
      await prs.connect(p2).resolveGameP2(p1.address, gameIndex);

      const p2EndBal = await p2.getBalance();

      const expectedP2Bal = p2StartBal.sub(parseEther(newEntryFee));
      console.log(
        'start',
        formatEther(p2StartBal.toString())
      );
      console.log(
        'end',
        formatEther(p2EndBal.toString())
      );
      console.log(
        'expected',
        formatEther(expectedP2Bal.toString())
      );

      await expect(p2EndBal).to.be.approximately(
        expectedP2Bal,
        parseEther('0.00001'),
      );
    });

    it('Should prevent a game from being resolved and paid multiple times');
  });
});