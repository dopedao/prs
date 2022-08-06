import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-watcher';
import 'hardhat-abi-exporter';

const config: HardhatUserConfig = {
  solidity: '0.8.15',
  gasReporter: {
    enabled: true,
  },
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
    pretty: true,
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
