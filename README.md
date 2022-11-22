# Account and ERC20 Demo for "Encode Starknet.js 101 Workshop"

Install latest LTS version of node (at the time of writing, version is v16.16.0) 

Run `npm install` in this directory.

In your own code please run `npm install starknet@next` for the latest version of starknet.js.

The Account contract used in this workshop is made by [OpenZeppelin](https://github.com/OpenZeppelin/cairo-contracts): **contract version 0.5.0**

The compiled Account.json was taken from the devnet [repo](https://github.com/Shard-Labs/starknet-devnet/tree/master/starknet_devnet/accounts_artifacts/OpenZeppelin/0.5.0/Account.cairo).

## Start the demo:

### Deploy Account

`node deploy_account.js`

**NOTE:** if you start like this, the workshop will run on the goerli testnet.

To start with the local devnet:

1. Install the devnet following the official [documentation](https://shard-labs.github.io/starknet-devnet/docs/intro) 
2. Go to the devnet repo and start:
`starknet-devnet --seed 0` -> `--seed 0` ensures the creation of same accounts each time
3. Go to the workshop repo and start like this:
`STARKNET_PROVIDER_BASE_URL=http://127.0.0.1:5050/ node deploy_account.js`

### Deploy ERC20

**NOTE:** tested on devnet only

`STARKNET_PROVIDER_BASE_URL=http://127.0.0.1:5050/ node deploy_erc20.js`

## Videos:
This workshop, along with general info about starknet.js, is shown in videos below:

- https://www.youtube.com/watch?v=gqj0ENOE0EE
  
- https://youtu.be/6jGlDBRvckU?t=2167

**Note:** these videos are outdated with regards to code, but still are nice introduction to Starknet.js

## Questions?

Ask in #starknet-js channel in the [StarkNet Discord](https://discord.gg/C2JsG2j7Fs)

DMs - 0xSean#1534 on Discord
