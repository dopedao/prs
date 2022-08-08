import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { ethers, network, deployments } from 'hardhat';

describe('TaxableGame', function () {
  beforeEach(async function () {
    [this.contractOwner, this.randomHacker, this.clumsyNoob] = await ethers.getSigners();
    const TaxableGameMock = await ethers.getContractFactory('TaxableGameMock');
    this.tgm = await TaxableGameMock.deploy();
  });

  describe('MIN_ENTRY_FEE', function () {
    it('sets as owner', async function () {
      const newMinEntry = parseEther('0.4444');
      const defaultMinEntry = await this.tgm.MIN_ENTRY_FEE(); // Should be 0.01 eth
      expect(defaultMinEntry).to.not.equal(newMinEntry);

      await this.tgm.setMinEntryFee(newMinEntry);
      const updatedMinEntry = await this.tgm.MIN_ENTRY_FEE();
      expect(updatedMinEntry).to.equal(newMinEntry);
    });

    it('prevents anyone else', async function () {
      await expect(this.tgm.connect(this.randomHacker).setMinEntryFee(parseEther('69.420'))).to.be
        .reverted;
    });
  });

  describe('TAX_PERCENT', function () {
    it('sets as owner', async function () {
      const newTax = parseEther('99');
      const defaultTax = await this.tgm.TAX_PERCENT(); // 5
      expect(defaultTax).to.not.equal(newTax);

      await this.tgm.setTaxPercent(newTax);
      const updatedTax = await this.tgm.TAX_PERCENT();
      expect(updatedTax).to.equal(newTax);
    });
    it('prevents anyone else', async function () {
      await expect(this.tgm.connect(this.randomHacker).setMinEntryFee(parseEther('100'))).to.be
        .reverted;
    });
  });

  describe('Balances', function () {
    it('should getBalance() of contract', async function () {
      const expectedContractBalance = parseEther('20');
      await this.contractOwner.sendTransaction({
        to: this.tgm.address,
        value: expectedContractBalance,
      });
      const balance = await this.tgm.getBalance();
      expect(balance).to.equal(expectedContractBalance);
    });

    it('allows contract owner to withdraw overages', async function () {
      const oldOwnerBalance = await this.contractOwner.getBalance();
      const moneyToBurn = parseEther('69');
      await this.clumsyNoob.sendTransaction({
        to: this.tgm.address,
        value: moneyToBurn,
      });
      await this.tgm.withdraw();
      const newOwnerBalance = await this.contractOwner.getBalance();
      
      expect(newOwnerBalance).
        to.be.approximately(
          oldOwnerBalance.add(moneyToBurn), 
          parseEther('0.0001')
        );

      expect(await this.tgm.getBalance()).to.eq(ethers.BigNumber.from(0));
    });

    it('should get balanceOf(player)', function () {});

    it('should prevent setBalance() for player', function () {});
  });
});
