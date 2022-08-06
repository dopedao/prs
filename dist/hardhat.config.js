"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-watcher");
require("hardhat-abi-exporter");
require("@typechain/hardhat");
require("@nomiclabs/hardhat-ethers");
const config = {
    solidity: '0.8.15',
    gasReporter: {
        enabled: true,
    },
    typechain: {
        outDir: 'types',
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
            ignoredFiles: ['**/.git'],
            verbose: true,
        },
    },
};
exports.default = config;
