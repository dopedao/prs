import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { parseEther, formatEther } from 'ethers/lib/utils';
import { ethers, network, deployments } from 'hardhat';
import { ERRORS, CHOICES } from './lib/constants';
import { deployPrs, setupGame } from './lib/helpers';
import { getRandomNumber } from './lib/utils';

describe('PRS-concurrency', function() {
  describe('Concurrency Tests', function() {
    it('Should allow multiple games', async function() {
      const { prs, p1, p2 } = await deployPrs();
      const numGames = getRandomNumber(2, 7);
      const entryFee = 1;
      const entryFeeEth = ethers.utils.parseEther(entryFee.toString());
      const gameIndex = 0;
      const p2Choice = CHOICES.SCISSORS;

      const balances = {
        p1: {
          before: await p1.getBalance(),
          after: BigNumber.from(0),
        },
        p2: {
          before: await p2.getBalance(),
          after: BigNumber.from(0),
        },
      };
      // TODO: Is this way too much gas? This seems wild.
      const approximateGasFee = ethers.utils.parseEther('0.05');
      let p2GasUsed = BigNumber.from(0);

      const clearChoice = CHOICES.PAPER + '-' + 'test';
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      for (let i = 0; i < numGames; i++) {
        await prs.connect(p1).makeGame(hashedChoice, { value: entryFeeEth });
      }

      for (let i = 0; i < numGames; i++) {
        await prs.connect(p2).joinGame(p1.address, i, p2Choice, { value: entryFeeEth });
        p2GasUsed = p2GasUsed.add(approximateGasFee);
      }

      const expectedContractBalance = (numGames * entryFee * 2).toString();
      const actualContractBalance = await prs.getBalance();
      expect(actualContractBalance).to.be.approximately(
        parseEther(expectedContractBalance),
        parseEther('0.0001'),
      );

      // p2 wins every time
      for (let i = 0; i < numGames; i++) {
        expect(await prs.connect(p1).resolveGameP1(gameIndex, clearChoice)).to.not.reverted;
      }

      const amountSpent = entryFeeEth.mul(numGames);

      balances.p1.after = await p1.getBalance();
      balances.p2.after = await p2.getBalance();

      expect(balances.p1.after).to.be.approximately(
        balances.p1.before.sub(amountSpent),
        parseEther('0.01'),
      );

      const TAX = await prs.TAX_PERCENT();
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
