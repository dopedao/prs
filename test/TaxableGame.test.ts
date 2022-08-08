import { expect } from 'chai';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { ethers, network, deployments } from 'hardhat';
import { ERRORS, CHOICES } from './lib/constants';

describe('TaxableGame', function () {
  beforeEach(async function () {
    [this.contractOwner, this.randomHacker, this.clumsyNoob] = await ethers.getSigners();
    const TaxableGameMock = await ethers.getContractFactory('TaxableGameMock');
    this.tg = await TaxableGameMock.deploy();
  });

  describe('MIN_ENTRY_FEE', function () {
    it('sets as owner', async function () {
      const newMinEntry = parseEther('0.4444');
      const defaultMinEntry = await this.tg.MIN_ENTRY_FEE(); // Should be 0.01 eth
      expect(defaultMinEntry).to.not.equal(newMinEntry);

      await this.tg.setMinEntryFee(newMinEntry);
      const updatedMinEntry = await this.tg.MIN_ENTRY_FEE();
      expect(updatedMinEntry).to.equal(newMinEntry);
    });

    it('prevents anyone else', async function () {
      await expect(this.tg.connect(this.randomHacker).setMinEntryFee(parseEther('69.420'))).
        to.be.reverted;
    });
  });

  describe('TAX_PERCENT', function () {
    it('sets as owner', async function () {
      const newTax = parseEther('99');
      const defaultTax = await this.tg.TAX_PERCENT(); // 5
      expect(defaultTax).to.not.equal(newTax);

      await this.tg.setTaxPercent(newTax);
      const updatedTax = await this.tg.TAX_PERCENT();
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

    it('allows contract owner to withdraw overages', async function () {
      const oldOwnerBalance = await this.contractOwner.getBalance();
      const moneyToBurn = parseEther('69');
      await this.clumsyNoob.sendTransaction({
        to: this.tg.address,
        value: moneyToBurn,
      });
      await this.tg.withdraw();
      const newOwnerBalance = await this.contractOwner.getBalance();
      
      expect(newOwnerBalance).
        to.be.approximately(
          oldOwnerBalance.add(moneyToBurn), 
          parseEther('0.0001')
        );

      expect(await this.tg.getBalance()).to.eq(ethers.BigNumber.from(0));
    });

    it('should get balanceOf(player)', async function () {
      const newBalance = parseEther('50');
      await this.tg.unsafeSetBalance(this.randomHacker.address, newBalance);
      expect(await this.tg.balanceOf(this.randomHacker.address)).
        to.equal(newBalance);
    });

  });
  
  describe('payoutWithAppliedTax', function() {
    it("Should revert if contract doesn't have enough tokens", async function() {
      const [p1, p2] = await ethers.getSigners();
      const entryFee = ethers.utils.parseEther('1');

      await expect(
        this.tg.unsafePayoutWithAppliedTax(p1.address, entryFee)
      ).to.be.revertedWith(
        ERRORS.NotEnoughMoneyInContract,
      );
    });

    it('Should apply tax', async function() {
      const [p1, p2] = await ethers.getSigners();

      const initialEntryFee = ethers.utils.parseEther('0.5');
      const TAX = await this.tg.TAX_PERCENT();

      const payout = initialEntryFee.mul(2).sub(initialEntryFee.mul(2).div(100).mul(TAX));
      const expectedBal = initialEntryFee.mul(2).sub(payout);

      await p1.sendTransaction({
        to: this.tg.address,
        value: initialEntryFee.mul(2),
      });

      await this.tg.unsafePayoutWithAppliedTax(p2.address, initialEntryFee);

      await expect(await this.tg.getBalance()).to.equal(expectedBal);
    });

    it('Should prevent the LOSER from getting paid');
    it('Should prevent random people from paying themselves');
    it('Should not let people drain the contract');
  });



});
