import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-watcher';

const config: HardhatUserConfig = {
  solidity: "0.8.15",
  gasReporter: {
    enabled: true
  },
  watcher: {
    test: {
      tasks: [
        'clean', 
        { command: 'compile', params: { quiet: true } },
        { command: 'test', params: { noCompile: true, parallel: true } },
      ],
      files: ['./contracts', './test'],
      ignoredFiles: ['**/.git'],
      verbose: true,
    },
  },
};

export default config;
