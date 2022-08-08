import { ethers, deployments } from 'hardhat';
import { CHOICES } from './constants';

// These are executed as "helpers" instead of "fixtures" because of this error in hardhat.
// https://github.com/NomicFoundation/hardhat/issues/2980
export async function deployPrs() {
  await deployments.fixture(["PRS"]);
  const prs = await ethers.getContract("PRS");
  const [p1, p2] = await ethers.getSigners();
  return { prs, p1, p2 };
}

export async function setupGame(etherAmount: string = '0.1') {
  await deployments.fixture(["PRS"]);
  const prs = await ethers.getContract("PRS");
  const [p1, p2] = await ethers.getSigners();
  
  const gameIndex = 0;
  const entryFee = ethers.utils.parseEther(etherAmount);
  
  const clearChoice = CHOICES.PAPER + '-' + 'test';
  const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);
  
  await prs.connect(p1).makeGame(hashedChoice, { value: entryFee });

  return { 
    clearChoice, 
    entryFee,
    gameIndex, 
    hashedChoice,
    p1, 
    p2, 
    prs, 
  };
}
