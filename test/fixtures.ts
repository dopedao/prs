import { ethers } from 'hardhat';
import { CHOICES } from './constants';

export async function deployPrs() {
  const PRS = await ethers.getContractFactory('PRS');
  const prs = await PRS.deploy();

  return { prs };
}

export async function createGame() {
  const PRS = await ethers.getContractFactory('PRS');
  const prs = await PRS.deploy();

  const [p1] = await ethers.getSigners();

  const clearChoice = CHOICES.PAPER + '-' + 'test';
  const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

  const entryFee = ethers.utils.parseEther('0.1'); /* 0.1 Eth */

  await prs.connect(p1).makeGame(hashedChoice, { value: entryFee });

  return { prs, p1, clearChoice, entryFee };
}
