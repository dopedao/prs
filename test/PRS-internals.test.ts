import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { CHOICES } from './lib/constants';

describe('PRS-internals', function () {
  beforeEach(async function () {
    [this.p1, this.p2] = await ethers.getSigners();
    const PRSMock = await ethers.getContractFactory('PRSMock');
    this.prsMock = await PRSMock.deploy();
  });

  describe('_getHashChoice', function () {
    it('Should return Scissors', async function () {
      const choice = CHOICES.SCISSORS;

      const clearChoice = `${choice}-test`;
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      await expect(
        await this.prsMock.connect(this.p1).unsafeGetHashChoice(hashedChoice, clearChoice),
      ).to.equal(choice);
    });

    it('Should return Paper', async function () {
      const choice = CHOICES.PAPER;

      const clearChoice = `${choice}-test`;
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      await expect(
        await this.prsMock.connect(this.p1).unsafeGetHashChoice(hashedChoice, clearChoice),
      ).to.equal(choice);
    });

    it('Should return Rock', async function () {
      const choice = CHOICES.ROCK;

      const clearChoice = `${choice}-test`;
      const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

      await expect(
        await this.prsMock.connect(this.p1).unsafeGetHashChoice(hashedChoice, clearChoice),
      ).to.equal(choice);
    });
  });

  describe('_chooseWinner', function () {
    it('Should pay p1 when paper and rock', async function () {
      const p1Choice = CHOICES.PAPER;
      const p2Choice = CHOICES.ROCK;
      const entryFee = parseEther('0.1');

      const TAX = await this.prsMock.taxPercent();
      const taxOnEntry = entryFee.div(100).mul(TAX).mul(2);

      await this.prsMock
        .connect(this.p1)
        .unsafeChooseWinner(p1Choice, p2Choice, this.p1.address, this.p2.address, entryFee.mul(2));

      const p1Bal = await this.prsMock.balanceOf(this.p1.address);

      await expect(p1Bal).to.be.approximately(entryFee.mul(2).sub(taxOnEntry), parseEther('0.05'));
    });

    it('Should pay p1 when rock and scissors', async function () {
      const p1Choice = CHOICES.ROCK;
      const p2Choice = CHOICES.SCISSORS;
      const entryFee = parseEther('0.1');

      const TAX = await this.prsMock.taxPercent();
      const taxOnEntry = entryFee.div(100).mul(TAX).mul(2);

      await this.prsMock
        .connect(this.p1)
        .unsafeChooseWinner(p1Choice, p2Choice, this.p1.address, this.p2.address, entryFee.mul(2));

      const p1Bal = await this.prsMock.balanceOf(this.p1.address);

      await expect(p1Bal).to.be.approximately(entryFee.mul(2).sub(taxOnEntry), parseEther('0.05'));
    });

    it('Should pay p1 when scissors and paper', async function () {
      const p1Choice = CHOICES.SCISSORS;
      const p2Choice = CHOICES.PAPER;
      const entryFee = parseEther('0.1');

      const TAX = await this.prsMock.taxPercent();
      const taxOnEntry = entryFee.div(100).mul(TAX).mul(2);

      await this.prsMock
        .connect(this.p1)
        .unsafeChooseWinner(p1Choice, p2Choice, this.p1.address, this.p2.address, entryFee.mul(2));

      const p1Bal = await this.prsMock.balanceOf(this.p1.address);

      await expect(p1Bal).to.be.approximately(entryFee.mul(2).sub(taxOnEntry), parseEther('0.05'));
    });

    it('Should pay both players when p1==p2', async function () {
      const p1Choice = CHOICES.PAPER;
      const p2Choice = CHOICES.PAPER;
      const entryFee = parseEther('0.1');

      const TAX = await this.prsMock.taxPercent();
      const taxOnEntry = entryFee.div(100).mul(TAX);

      await this.prsMock.unsafeChooseWinner(
        p1Choice,
        p2Choice,
        this.p1.address,
        this.p2.address,
        entryFee.mul(2),
      );

      const p1Bal = await this.prsMock.balanceOf(this.p1.address);
      const p2Bal = await this.prsMock.balanceOf(this.p2.address);

      await expect(p1Bal).to.approximately(entryFee.sub(taxOnEntry), parseEther('0.001'));
      await expect(p2Bal).to.approximately(entryFee.sub(taxOnEntry), parseEther('0.001'));
    });
  });
});
