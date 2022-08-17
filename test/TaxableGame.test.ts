import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { ethers, network, deployments } from 'hardhat';
import { ERRORS, CHOICES } from './lib/constants';

describe('TaxableGame', function () {
  beforeEach(async function () {
    [this.contractOwner, this.randomHacker, this.clumsyNoob] = await ethers.getSigners();
    const TaxableGameMock = await ethers.getContractFactory('TaxableGameMock');
    const paperMock = await ethers.getContractFactory('PaperMock');
    this.tg = await TaxableGameMock.deploy();
    this.pm = await paperMock.deploy();
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
      await expect(this.tg.connect(this.randomHacker).setMinEntryFee(parseEther('69.420'))).
        to.be.reverted;
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
      await this.contractOwner.sendTransaction({
        to: this.tg.address,
        value: expectedContractBalance,
      });
      const balance = await this.tg.getBalance();
      expect(balance).to.equal(expectedContractBalance);
    });

    it('allows contract owner to withdraw balance for contract itself', async function () {
      console.log("yea1")
      const oldOwnerBalance = await this.contractOwner.getBalance();

      console.log("yea2")
      const fakeTaxMoney = parseEther('69');
      await this.tg.connect(this.contractOwner).changePaperContract(this.tg.address)
      console.log("yea3")

      await this.pm.connect(this.contractOwner).mintTo(this.tg.address, fakeTaxMoney);
      console.log("yea4")

      // Fake setting balance for contract
      await this.tg.unsafeSetBalance(this.tg.address, BigNumber.from(0));
      console.log("yea5")
      await this.tg.unsafeSetBalance(this.tg.address, fakeTaxMoney);
      console.log("yea6")

      console.log(await this.tg.balanceOf(this.tg.address));
      console.log(await this.tg.balanceOf(this.contractOwner.address));

      console.log(await this.pm.balanceOf(this.tg.address));

      await this.tg.connect(this.contractOwner).withdrawTax();
      console.log("yea7")
      const newOwnerBalance = await this.tg.balanceOf(this.contractOwner.address);
      console.log("yea yea")
      
      expect(newOwnerBalance).
        to.be.approximately(
          oldOwnerBalance, 
          // Calling unsafeSetBalance and withdrawTax takes some gas
          parseEther('0.01')
        );
      console.log("yea yea yea")

      expect(await this.tg.balanceOf(this.tg.address)).to.eq(ethers.BigNumber.from(0));
    });

    it('should get balanceOf(player)', async function () {
      const newBalance = parseEther('50');
      await this.tg.unsafeSetBalance(this.randomHacker.address, newBalance);
      expect(await this.tg.balanceOf(this.randomHacker.address)).
        to.equal(newBalance);
    });

  });
  
  describe('payout', function() {
    it('Should apply tax to payout', async function() {
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
