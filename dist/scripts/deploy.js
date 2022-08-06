"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    const Rps = await hardhat_1.ethers.getContractFactory("RPS");
    const rps = await Rps.deploy();
    await rps.deployed();
    console.log("Rps deployed to:", rps.address);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
