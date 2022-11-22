///////////////////////////
//
// WIP STEP 2
//
// the account we use here is already prefunded in the devnet
//
///////////////////////////


import fs from "fs";
import readline from "readline";

// Install the latest version of starknet with npm install starknet@next and import starknet
import {
  Account,
  Contract,
  defaultProvider,
  ec,
  json,
  stark,
  SequencerProvider,
  number
} from "starknet";

const provider = process.env.STARKNET_PROVIDER_BASE_URL === undefined ?
  defaultProvider :
  new SequencerProvider({ baseUrl: process.env.STARKNET_PROVIDER_BASE_URL });

// devnet private key from Account #0 if generated with --seed 0
const starkKeyPair = ec.getKeyPair("0xe3e70682c2094cac629f6fbed82c07cd");
const accountAddress = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";

// Use your new account address
const account = new Account(
    provider,
    accountAddress,
    starkKeyPair
  );

console.log("Reading ERC20 Contract...");
const compiledErc20 = json.parse(
  fs.readFileSync("./ERC20.json").toString("ascii")
);

// Deploy an ERC20 contract and wait for it to be verified on StarkNet.
console.log("Deployment Tx - ERC20 Contract to StarkNet...");
const erc20Response = await provider.deployContract({
  contract: compiledErc20,
});

// Wait for the deployment transaction to be accepted on StarkNet
console.log("Waiting for Tx to be Accepted on Starknet - ERC20 Deployment...");
await provider.waitForTransaction(erc20Response.transaction_hash);

// Get the erc20 contract address
const erc20Address = erc20Response.contract_address;
console.log("ERC20 Address: ", erc20Address);

// Create a new erc20 contract object
const erc20 = new Contract(compiledErc20.abi, erc20Address, provider);

erc20.connect(account);

// Mint 1000 tokens to account address
console.log(`Invoke Tx - Minting 1000 tokens to ${account.address}...`);
const { transaction_hash: mintTxHash } = await erc20.mint(
  account.address,
  "1000",
  { 
    // transaction can be rejected if maxFee is lower than actual
    // Error: REJECTED: FEE_TRANSFER_FAILURE
    // Actual fee exceeded max fee.
    maxFee: "999999995330000" 
  }
);

// Wait for the invoke transaction to be accepted on StarkNet
console.log(`Waiting for Tx to be Accepted on Starknet - Minting...`);
await provider.waitForTransaction(mintTxHash);

// Check balance - should be 1000
console.log(`Calling StarkNet for account balance...`);
const balanceBeforeTransfer = await erc20.balance_of(account.address);

console.log(
  `account Address ${account.address} has a balance of:`,
  number.toBN(balanceBeforeTransfer.res, 16).toString()
);

// Execute tx transfer of 10 tokens
console.log(`Invoke Tx - Transfer 10 tokens back to erc20 contract...`);
const { code, transaction_hash: transferTxHash } = await account.execute(
  {
    contractAddress: erc20Address,
    entrypoint: "transfer",
    calldata: [erc20Address, "10"],
  },
  undefined,
  { 
    maxFee: "999999995330000" 
  }
);

// Wait for the invoke transaction to be accepted on StarkNet
console.log(`Waiting for Tx to be Accepted on Starknet - Transfer...`);
await provider.waitForTransaction(transferTxHash);

// Check balance after transfer - should be 990
console.log(`Calling StarkNet for account balance...`);
const balanceAfterTransfer = await erc20.balance_of(account.address);

console.log(
  `account Address ${account.address} has a balance of:`,
  number.toBN(balanceAfterTransfer.res, 16).toString()
);