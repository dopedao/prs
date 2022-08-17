import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { CHOICES } from './lib/constants';
import { getRandomNumber } from './lib/utils';
import { deployPaperMock, deployPrs } from './lib/helpers';

describe('PRS-concurrency', function () {
  describe('Concurrency Tests', function () {
    beforeEach(async function () {
      const { prsMock, p1, p2 } = await deployPrs();
      const { paperMock } = await deployPaperMock();
      this.prsMock = prsMock;
      this.p1 = p1;
      this.p2 = p2;
      this.paperMock = paperMock;
    });

    it('Should allow multiple games', async function () {
      const numGames = getRandomNumber(2, 7);
      const entryFee = 1;
      const entryFeeEth = ethers.utils.parseEther(entryFee.toString());
      const p2Choice = CHOICES.SCISSORS;
      const paperAmount = parseEther("20");

      await this.paperMock.connect(this.p1).mint(paperAmount);
      await this.paperMock.connect(this.p2).mint(paperAmount);

      await this.prsMock.connect(this.p1).changePaperContract(this.paperMock.address)
      await this.paperMock.connect(this.p1).approve(this.prsMock.address, paperAmount);
      await this.paperMock.connect(this.p2).approve(this.prsMock.address, paperAmount);

      console.log(await this.paperMock.balanceOf(this.p1.address));
      console.log(await this.paperMock.balanceOf(this.p2.address));

      await this.prsMock.connect(this.p1).depositPaper(parseEther("20"));
      await this.prsMock.connect(this.p2).depositPaper(parseEther("20"));

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

      const p2ClearChoice = p2Choice + '-' + 'test';
      const hashedP2Choice = ethers.utils.soliditySha256(['string'], [p2ClearChoice]);

      for (let i = 0; i < numGames; i++) {
        await this.prsMock.connect(this.p1).startGame(hashedChoice, entryFeeEth);
      }

      for (let i = 0; i < numGames; i++) {
        await this.prsMock.connect(this.p2).joinGame(i, hashedP2Choice, entryFeeEth);
      }

      // p1 reveals choice
      for (let i = 0; i < numGames; i++) {
        await this.prsMock.connect(this.p1).revealChoice(i, clearChoice);
      }

      // p2 reveals chocie
      for (let i = 0; i < numGames; i++) {
        await this.prsMock.connect(this.p2).revealChoice(i, p2ClearChoice);
      }

      // p2 wins every time
      for (let i = 0; i < numGames; i++) {
        expect(await this.prsMock.connect(this.p1).
          resolveGame(i)
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
