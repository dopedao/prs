import { expect } from 'chai';
import { ethers, network, deployments } from 'hardhat';
import { ERRORS, CHOICES } from './lib/constants';
import { deployPrs, setupGame } from './lib/helpers';

describe('PRS-payouts', function() {

  describe('payoutWithAppliedTax', function() {
    it("Should revert if contract doesn't have enough tokens", async function() {
      const { prs, p1 } = await deployPrs();
      const entryFee = ethers.utils.parseEther('1');

      await expect(prs.payoutWithAppliedTax(p1.address, entryFee)).to.revertedWith(
        ERRORS.NotEnoughMoneyInContract,
      );
    });

    it('Should apply tax', async function() {
      const { prs, p1, p2 } = await deployPrs();

      const initialEntryFee = ethers.utils.parseEther('0.5');
      const TAX = await prs.TAX_PERCENT();

      const payout = initialEntryFee.mul(2).sub(initialEntryFee.mul(2).div(100).mul(TAX));
      const expectedBal = initialEntryFee.mul(2).sub(payout);

      await p1.sendTransaction({
        to: prs.address,
        value: initialEntryFee.mul(2),
      });

      await prs.payoutWithAppliedTax(p2.address, initialEntryFee);

      await expect(await prs.getBalance()).to.equal(expectedBal);
    });

    it('Should prevent the LOSER from getting paid');
    it('Should prevent random people from paying themselves');
    it('Should not let people drain the contract');
  });

});
