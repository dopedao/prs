import { expect } from 'chai';
import { ethers } from 'hardhat';
import { deployPrs } from './lib/helpers';

describe('PRS-inheritance', function () {
  describe('Ownable', function () {
    it('Uses the Ownable interface correctly', async function () {
      const { prsMock, p1 } = await deployPrs();
      const owner = await prsMock.owner();
      expect(owner).to.eq(p1.address);
    });
    it('Renounces ownership', async function () {
      const { prsMock } = await deployPrs();
      await prsMock.renounceOwnership();
      const owner = await prsMock.owner();
      expect(owner).to.eq(ethers.constants.AddressZero);
    });
  });

  describe('Pausable', function () {
    it('Pauses and unpauses the contract', async function() {
      const { prsMock } = await deployPrs();
      await prsMock.pauseGame();
      expect (await prsMock.paused()).to.be.true;
      await prsMock.unpauseGame();
      expect (await prsMock.paused()).to.be.false;
    });
  });
});
