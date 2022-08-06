import { ethers } from 'hardhat';
import { CHOICES } from './constants';

export async function deployRps() {
  const RPS = await ethers.getContractFactory('RPS');
  const rps = await RPS.deploy();

  return { rps };
}

export async function createGame() {
  const RPS = await ethers.getContractFactory('RPS');
  const rps = await RPS.deploy();

  const [p1] = await ethers.getSigners();

  const clearChoice = CHOICES.PAPER + '-' + 'test';
  const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

  const entryFee = ethers.utils.parseEther('0.1'); /* 0.1 Eth */

  await rps.connect(p1).makeGame(hashedChoice, { value: entryFee });

  return { rps, p1, clearChoice, entryFee };
}
