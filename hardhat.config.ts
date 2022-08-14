import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@typechain/hardhat';

import 'hardhat-abi-exporter';
import 'hardhat-deploy';
import 'hardhat-watcher';

import { HardhatUserConfig } from 'hardhat/config';

import 'dotenv/config';

const config: HardhatUserConfig = {
  solidity: '0.8.12',
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: 0,
  },
  // Use non-standard path common to Forge.
  // If we decide to change later we can.
  paths: {
    sources: 'src',
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPrice: 22,
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
        { command: 'test', params: { noCompile: true } },
      ],
      files: ['./src', './test'],
      ignoredFiles: ['**/.git', 'dist/*', 'types/*'],
      verbose: true,
    },
  },
  networks: {
    // mainnets
    ethereum: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${
        process.env.ETHEREUM_API_KEY ?? ""
      }`,
      deploy: ['deploy/ethereum/'],
      accounts:
        process.env.ETHEREUM_PRIVATE_KEY !== undefined
          ? [process.env.ETHEREUM_PRIVATE_KEY]
          : [],
    },
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${
        process.env.OPTIMISM_API_KEY ?? ""
      }`,
      deploy: ['deploy/optimism/'],
      accounts:
        process.env.OPTIMISM_PRIVATE_KEY !== undefined
          ? [process.env.OPTIMISM_PRIVATE_KEY]
          : [],
    },
    // testnets
    "ethereum-goerli": {
      url: `https://eth-goerli.alchemyapi.io/v2/${
        process.env.ETHEREUM_GOERLI_API_KEY ?? ""
      }`,
      deploy: ['deploy/ethereum-goerli/'],
      accounts:
        process.env.ETHEREUM_GOERLI_PRIVATE_KEY !== undefined
          ? [process.env.ETHEREUM_GOERLI_PRIVATE_KEY]
          : [],
    },
    "optimism-kovan": {
      url: `https://opt-kovan.g.alchemy.com/v2/${
        process.env.OPTIMISM_KOVAN_API_KEY ?? ""
      }`,
      deploy: ['deploy/optimism-kovan/'],
      accounts:
        process.env.OPTIMISM_KOVAN_PRIVATE_KEY !== undefined
          ? [process.env.OPTIMISM_KOVAN_PRIVATE_KEY]
          : [],
    },
    "optimism-goerli": {
      url: `https://opt-goerli.g.alchemy.com/v2/${
        process.env.OPTIMISM_GOERLI_API_KEY ?? ""
      }`,
      deploy: ['deploy/optimism-goerli/'],
      gasPrice: 50000000000, // 50gwei
      accounts:
        process.env.OPTIMISM_GOERLI_PRIVATE_KEY !== undefined
          ? [process.env.OPTIMISM_GOERLI_PRIVATE_KEY]
          : [],
    },
    hardhat: {
      deploy: ['deploy/hardhat/'],
      gasPrice: 50000000000, // 50gwei
      mining: {
        auto: !(process.env.HARDHAT_DISABLE_AUTO_MINING === "true"),
        interval: [100, 3000],
      },
    },
  }
};

export default config;
