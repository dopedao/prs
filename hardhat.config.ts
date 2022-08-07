import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-watcher';
import 'hardhat-abi-exporter';

import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';


const config: HardhatUserConfig = {
  solidity: '0.8.15',
  gasReporter: {
    enabled: true,
  },
  // Use non-standard path common to Forge.
  // If we decide to change later we can.
  paths: {
    sources: 'src',
  },
  typechain: {
    outDir: 'dist/types',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    // externalArtifacts: ['externalArtifacts/*.json'], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
    // dontOverrideCompile: false // defaults to false
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
      ignoredFiles: ['**/.git', 'dist/*', 'types/*'],
      verbose: true,
    },
  },
};

export default config;
