import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { Contract, Signer } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers, network, deployments } from 'hardhat';
import { ERRORS, CHOICES } from './lib/constants';
import { deployPrs, createGame } from './lib/helpers';
import { getRandomNumber } from './lib/utils';

describe('PRS-payouts', function () {

  describe('payoutWithAppliedTax', function () {
    it("Should revert if contract doesn't have enough tokens", async function () {
      const { prs, p1 } = await deployPrs();
      const entryFee = ethers.utils.parseEther('1');

      await expect(prs.payoutWithAppliedTax(p1.address, entryFee)).to.revertedWith(
        ERRORS.NotEnoughMoneyInContract,
      );
    });

    it('Should apply tax', async function () {
      const { prs, p1 } = await deployPrs();

      const initialEntryFee = ethers.utils.parseEther('0.5');
      const TAX = await prs.TAX_PERCENT();

      const payout = initialEntryFee.mul(2).sub(initialEntryFee.mul(2).div(100).mul(TAX));
      const expectedBal = initialEntryFee.mul(2).sub(payout);

      await prs.connect(p1).rcv({ value: initialEntryFee.mul(2) });
      await prs.payoutWithAppliedTax(p1.address, initialEntryFee);

      await expect(await prs.getBalance()).to.equal(expectedBal);
    });

    it('Should prevent the LOSER from getting paid');
    it('Should prevent random people from paying themselves');
    it('Should not let people drain the contract');
  });

});
