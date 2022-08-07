import { ethers } from "hardhat";

async function main() {
  const Rps = await ethers.getContractFactory("PRS");
  const prs = await Rps.deploy();

  await prs.deployed();

  console.log("Rps deployed to:", prs.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
