import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-watcher';
import 'hardhat-abi-exporter';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
declare const config: HardhatUserConfig;
export default config;
