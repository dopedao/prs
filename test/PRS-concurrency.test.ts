import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { parseEther, formatEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { CHOICES } from './lib/constants';
import { getRandomNumber } from './lib/utils';

describe('PRS-concurrency', function () {
  describe('Concurrency Tests', function () {
    beforeEach(async function () {
      [this.p1, this.p2] = await ethers.getSigners();
      const PRSMock = await ethers.getContractFactory('PRSMock');
      this.prsMock = await PRSMock.deploy();
    });

    it('Should allow multiple games', async function () {
      const numGames = getRandomNumber(2, 7);
      const entryFee = 1;
      const entryFeeEth = ethers.utils.parseEther(entryFee.toString());
      const gameIndex = 0;
      const p2Choice = CHOICES.SCISSORS;

      // Ensure players can join multiple times by loading big balance
      await this.p1.sendTransaction({
        to: this.prsMock.address,
        value: ethers.utils.parseEther('20'),
      });
      await this.p2.sendTransaction({
        to: this.prsMock.address,
        value: ethers.utils.parseEther('20'),
      });

      const balances = {
        p1: {
          before: await this.prsMock.balanceOf(this.p1.address),
          after: BigNumber.from(0),
        },
        p2: {
          before: await this.prsMock.balanceOf(this.p2.address),
          after: BigNumber.from(0),
        },
      };

      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      for (let i = 0; i < numGames; i++) {
        await this.prsMock.connect(this.p1).startGame(hashedChoice, entryFeeEth);
      }

      for (let i = 0; i < numGames; i++) {
        await this.prsMock.connect(this.p2).joinGame(this.p1.address, i, p2Choice, entryFeeEth);
      }

      // p2 wins every time
      for (let i = 0; i < numGames; i++) {
        expect(await this.prsMock.connect(this.p1).
          resolveGameP1(gameIndex, clearChoice)
        ).to.not.be.reverted;
      }

      const amountSpent = entryFeeEth.mul(numGames);

      balances.p1.after = await this.prsMock.balanceOf(this.p1.address);
      balances.p2.after = await this.prsMock.balanceOf(this.p2.address);

      expect(balances.p1.after).to.be.approximately(
        balances.p1.before.sub(amountSpent),
        parseEther('0.0001'),
      );

      const TAX = await this.prsMock.taxPercent();
      const totalTax = entryFeeEth.mul(2).div(100).mul(TAX).mul(numGames);
      const payout = entryFeeEth.mul(numGames).mul(2).sub(totalTax);

      const expectedP2Balance = balances.p2.before.
        sub(entryFeeEth.mul(numGames)).
        add(payout);
      expect(balances.p2.after).
        to.be.approximately(expectedP2Balance, parseEther('0.001'));
    });
  });
});
