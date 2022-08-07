import { ethers, deployments } from 'hardhat';
import { CHOICES } from './constants';

export async function deployPrs() {
  await deployments.fixture(["PRS"]);
  const prs = await ethers.getContract("PRS");
  const [p1, p2] = await ethers.getSigners();
  return { prs, p1, p2 };
}

export async function createGame() {
  await deployments.fixture(["PRS"]);
  const prs = await ethers.getContract("PRS");
  const [p1] = await ethers.getSigners();

  const clearChoice = CHOICES.PAPER + '-' + 'test';
  const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

  const entryFee = ethers.utils.parseEther('0.1'); /* 0.1 Eth */
  await prs.connect(p1).makeGame(hashedChoice, { value: entryFee });
  return { prs, p1, clearChoice, entryFee };
}
