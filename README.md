# PAPER ROCK SCISSORS

A simple token-based game of skill deployed on the ethereum blockchains.

This repo makes extensive use of the [hardhat](https://hardhat.org) development and deployment framework for solidity; for development, testing, and deployment.

## Setup

Please see the [.env.example](./.env.example) file for items you will have to fill out in order to develop, test, and deploy these contracts. If developing you must copy that file to `.env`, and fill out the values.

## Development

```sh
# Run hardhat node
yarn dev

# Build ABI files for react front-end binding
yarn build
```

## Testing

Most "development" of this project you'll spend your time on is in testing. To test, run the commands below.

```sh
# One-off run of tests 
yarn test

# Continually watch files and re-test on file save
# (Have to save a file first 😅 …does not run automatically)
yarn test:watch
```

## Deployment

Deployment of scripts is handled with the extensive [hardhat-deploy plugin](https://github.com/wighawag/hardhat-deploy). It has a variety of complex configurations possible.

PRS takes advantage of multi-chain deployments by specifying multiple entries in the `networks` section of [hardhat.config.ts](./hardhat.config.ts). Inside each you'll find a custom entry for `deploy`, which allows us to use multiple folders for deployment scripts, relevant to each chain we deploy on.

```sh
# Deploy it to the local hardhat network
yarn deploy:test

# Deploy it to eth goerli
yarn deploy:dev
```

### Contract source code verification

Assuming you've setup your `.env` file correctly with an `ETHERSCAN_API_KEY`, run the following after making a deployment to a live network above.

```sh
yarn hardhat verify --network $NETWORK $CONTRACT_ADDRESS $TABLELAND_GATEWAY_ADDRESS_FOR_NETWORK
```
