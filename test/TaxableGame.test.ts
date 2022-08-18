import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { ERRORS } from './lib/constants';

describe('TaxableGame', function () {
  beforeEach(async function () {
    [this.contractOwner, this.randomHacker, this.clumsyNoob] = await ethers.getSigners();
    const TaxableGameMock = await ethers.getContractFactory('TaxableGameMock');
    const paperMock = await ethers.getContractFactory('PaperMock');
    this.tg = await TaxableGameMock.deploy();
    this.pm = await paperMock.deploy();

    await this.tg.connect(this.contractOwner).changePaperContract(this.pm.address);
  });

  describe('minEntryFee', function () {
    it('sets as owner', async function () {
      const newMinEntry = parseEther('0.4444');
      const defaultMinEntry = await this.tg.minEntryFee(); // Should be 0.01 eth
      expect(defaultMinEntry).to.not.equal(newMinEntry);

      await this.tg.setMinEntryFee(newMinEntry);
      const updatedMinEntry = await this.tg.minEntryFee();
      expect(updatedMinEntry).to.equal(newMinEntry);
    });

    it('prevents anyone else', async function () {
      await expect(this.tg.connect(this.randomHacker).setMinEntryFee(parseEther('69.420'))).to.be
        .reverted;
    });
  });

  describe('taxPercent', function () {
    it('sets as owner', async function () {
      const newTax = parseEther('99');
      const defaultTax = await this.tg.taxPercent(); // 5
      expect(defaultTax).to.not.equal(newTax);

      await this.tg.setTaxPercent(newTax);
      const updatedTax = await this.tg.taxPercent();
      expect(updatedTax).to.equal(newTax);
    });
    it('prevents anyone else', async function () {
      await expect(this.tg.connect(this.randomHacker).setMinEntryFee(parseEther('100'))).to.be
        .reverted;
    });
  });

  describe('Balances', function () {
    it('should getBalance() of contract', async function () {
      const expectedContractBalance = parseEther('20');

      await this.pm.connect(this.contractOwner).mintTo(this.tg.address, expectedContractBalance);

      const balance = await this.tg.getPaperBalance();
      expect(balance).to.equal(expectedContractBalance);
    });

    it('allows contract owner to withdraw balance for contract itself', async function () {
      const fakeTaxMoney = parseEther('69');
      await this.pm.connect(this.contractOwner).mintTo(this.tg.address, fakeTaxMoney);

      const fakePlayerMoney = parseEther('1');

      // Fake set balance for user
      await this.tg.unsafeSetBalance(this.clumsyNoob.address, fakePlayerMoney);

      const oldOwnerBalance = await this.tg
        .connect(this.clumsyNoob)
        .balanceOf(this.clumsyNoob.address);

      // Fake setting balance for contract
      await this.tg.unsafeSetBalance(this.tg.address, BigNumber.from(0));
      await this.tg.unsafeSetBalance(this.tg.address, fakeTaxMoney);

      await this.tg.connect(this.contractOwner).withdrawTax();
      const newOwnerBalance = await this.tg.balanceOf(this.clumsyNoob.address);

      expect(newOwnerBalance).to.eq(oldOwnerBalance);

      expect(await this.tg.balanceOf(this.tg.address)).to.eq(ethers.BigNumber.from(0));
    });

    it('should get balanceOf(player)', async function () {
      const newBalance = parseEther('50');
      await this.tg.unsafeSetBalance(this.randomHacker.address, newBalance);
      expect(await this.tg.balanceOf(this.randomHacker.address)).to.equal(newBalance);
    });

    it('allows players to withdraw their balance', async function () {
      const withdrawAmount = parseEther('10');
      await this.pm.connect(this.contractOwner).mintTo(this.tg.address, withdrawAmount);

      await this.tg.unsafeSetBalance(this.clumsyNoob.address, withdrawAmount);
      await this.tg.connect(this.clumsyNoob).withdraw(withdrawAmount);

      expect(await this.pm.connect(this.clumsyNoob).balanceOf(this.clumsyNoob.address)).to.eq(withdrawAmount);
      expect(await this.tg.connect(this.clumsyNoob).balanceOf(this.clumsyNoob.address)).to.eq(BigNumber.from(0))
    })

    it('Does not allow players to withdraw more than in their balance', async function () {
      const withdrawAmount = parseEther('10');
      const contractBal = withdrawAmount.mul(2);
      await this.pm.connect(this.contractOwner).mintTo(this.tg.address, contractBal);

      await this.tg.unsafeSetBalance(this.clumsyNoob.address, withdrawAmount);
      await expect(this.tg.connect(this.clumsyNoob).withdraw(contractBal)).to.be.revertedWithCustomError(
        this.tg,
        ERRORS.PlayerBalanceNotEnough
      )
    })
  });

  describe('payout', function () {
    it('Should apply tax to payout', async function () {
      const [p1] = await ethers.getSigners();

      const initialEntryFee = ethers.utils.parseEther('0.5');
      const TAX_PCT = await this.tg.taxPercent();

      const taxAmount = initialEntryFee.div(100).mul(TAX_PCT);
      const payout = initialEntryFee.sub(taxAmount);

      // This is unsafe because we won't have enough to actually pay
      // the contract balance out in real tokens.
      await this.tg.unsafePayout(p1.address, initialEntryFee);

      await expect(await this.tg.balanceOf(this.tg.address)).to.equal(taxAmount);
      await expect(await this.tg.balanceOf(p1.address)).to.equal(payout);
    });
  });
});
