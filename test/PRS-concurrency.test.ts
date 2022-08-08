import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { CHOICES } from './lib/constants';
import { getRandomNumber } from './lib/utils';

describe('PRS-concurrency', function() {
  describe('Concurrency Tests', function() {
    beforeEach(async function () {
        [this.p1, this.p2] = await ethers.getSigners();
        const PRSMock = await ethers.getContractFactory('PRSMock');
        this.prsMock = await PRSMock.deploy();
    });

    it('Should allow multiple games', async function() {
      const numGames = getRandomNumber(2, 7);
      const entryFee = 1;
      const entryFeeEth = ethers.utils.parseEther(entryFee.toString());
      const gameIndex = 0;
      const p2Choice = CHOICES.SCISSORS;

      const balances = {
        p1: {
          before: await this.p1.getBalance(),
          after: BigNumber.from(0),
        },
        p2: {
          before: await this.p2.getBalance(),
          after: BigNumber.from(0),
        },
      };
      // TODO: Is this way too much gas? This seems wild.
      const approximateGasFee = ethers.utils.parseEther('0.05');
      let p2GasUsed = BigNumber.from(0);

      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      for (let i = 0; i < numGames; i++) {
        await this.prsMock.connect(this.p1).makeGame(hashedChoice, { value: entryFeeEth });
      }

      for (let i = 0; i < numGames; i++) {
        await this.prsMock.connect(this.p2).joinGame(this.p1.address, i, p2Choice, { value: entryFeeEth });
        p2GasUsed = p2GasUsed.add(approximateGasFee);
      }

      const expectedContractBalance = (numGames * entryFee * 2).toString();
      const actualContractBalance = await this.prsMock.getBalance();
      expect(actualContractBalance).to.be.approximately(
        parseEther(expectedContractBalance),
        parseEther('0.0001'),
      );

      // p2 wins every time
      for (let i = 0; i < numGames; i++) {
        expect(await this.prsMock.connect(this.p1).resolveGameP1(gameIndex, clearChoice)).to.not.reverted;
      }

      const amountSpent = entryFeeEth.mul(numGames);

      balances.p1.after = await this.p1.getBalance();
      balances.p2.after = await this.p2.getBalance();

      expect(balances.p1.after).to.be.approximately(
        balances.p1.before.sub(amountSpent),
        parseEther('0.01'),
      );

      const TAX = await this.prsMock.TAX_PERCENT();
      const totalTax = entryFeeEth.mul(2).div(100).mul(TAX).mul(numGames);
      const payout = entryFeeEth
        .mul(numGames)
        .mul(2)
        .sub(totalTax)
        .div(2);

      const expectedP2Balance = balances.p2.before.sub(p2GasUsed).add(payout);
      // console.log('payout', formatEther(payout));
      // console.log('gas used', formatEther(p2GasUsed));
      // console.log('expectedP2', formatEther(expectedP2Balance));
      // console.log('p2after', formatEther(balances.p2.after));
      // console.log('p1after', formatEther(balances.p1.after));
      // console.log('contract balance', formatEther(await prs.getBalance()));
      expect(balances.p2.after).
        to.be.approximately(
          expectedP2Balance, 
          parseEther('0.001')
        );
    });
  });
});
