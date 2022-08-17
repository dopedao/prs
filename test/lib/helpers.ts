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

export async function deployPaperMock() {
    await deployments.fixture(['PaperMock']);
    const paperMock = await ethers.getContract('PaperMock');

    return { paperMock };
}

export function clearAndHashChoice(choices: CHOICES) {
  const clearChoice = choices + '-' + 'some-un-hackable-password';
  const hashedChoice = ethers.utils.soliditySha256(['string'], [clearChoice]);

  return [
    clearChoice,
    hashedChoice
  ]
}

export async function setupGame(paperAmount: string = '0.1') {
  const { prsMock, p1, p2 } = await deployPrs();
  const { paperMock } = await deployPaperMock();

  const gameIndex = 0;
  const entryFee = ethers.utils.parseEther(paperAmount);

  const [ clearChoice, hashedChoice ] = clearAndHashChoice(CHOICES.PAPER);

  // Change paper contract to our mock
  await prsMock.connect(p1).changePaperContract(paperMock.address);

  // Mint paperAmount
  await paperMock.connect(p1).mint(entryFee);
  await paperMock.connect(p2).mint(entryFee);

  // Approve prs to move paper for us
  await paperMock.connect(p1).approve(prsMock.address, entryFee);
  await paperMock.connect(p2).approve(prsMock.address, entryFee);

  // Load our balance up for p1 + p2
  await prsMock.connect(p1).depositPaper(entryFee);
  await prsMock.connect(p2).depositPaper(entryFee);

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
    paperMock
  };
}
