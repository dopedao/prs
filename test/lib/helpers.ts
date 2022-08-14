import { ethers, deployments } from 'hardhat';
import { CHOICES } from './constants';

// These are executed as "helpers" instead of "fixtures" because of this error in hardhat.
// https://github.com/NomicFoundation/hardhat/issues/2980
export async function deployPrs() {
  await deployments.fixture(['PRSMock']);
  const prsMock = await ethers.getContract("PRSMock");
  const [p1, p2] = await ethers.getSigners();
  return { prsMock, p1, p2 };
}

export function clearAndHashChoice(choices: CHOICES) {
  const clearChoice = choices + '-' + 'some-un-hackable-password';
  const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

  return [
    clearChoice,
    hashedChoice
  ]
}

export async function setupGame(etherAmount: string = '0.1') {
  const { prsMock, p1, p2 } = await deployPrs();

  const gameIndex = 0;
  const entryFee = ethers.utils.parseEther(etherAmount);

  const [ clearChoice, hashedChoice ] = clearAndHashChoice(CHOICES.PAPER);

  // Load our balance up for p1 + p2
  await p1.sendTransaction({ to: prsMock.address, value: entryFee });
  await p2.sendTransaction({ to: prsMock.address, value: entryFee });
  // Start the game now we have a balance
  await prsMock.connect(p1).startGame(hashedChoice, entryFee);

  return {
    clearChoice,
    entryFee,
    gameIndex,
    hashedChoice,
    p1,
    p2,
    prsMock,
  };
}
