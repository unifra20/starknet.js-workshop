///////////////////////////
//
// ERC20 DEPLOYMENT AND INTERACTION
//
// The account we use here is already prefunded in the devnet.
//
// We shall deploy and call the OpenZeppelin ERC20 contract.
//
///////////////////////////

import fs from "fs";

// Install the latest version of starknet with npm install starknet@next and import starknet
import {
  Account,
  Contract,
  RpcProvider,
  defaultProvider,
  ec,
  json,
  number,
  shortString,
  stark,
} from "starknet";

// SETUP

const provider =
  process.env.STARKNET_NODE_PROVIDER_URL === undefined
    ? defaultProvider
    : new RpcProvider({ nodeUrl: process.env.STARKNET_NODE_PROVIDER_URL });

console.log("Reading ERC20 Contract...");
const compiledErc20 = json.parse(
  fs.readFileSync("./ERC20.json").toString("ascii")
);

// Note: cleanHex will be redundant with nevwer starknet.js version
const cleanHex = (hex) => hex.toLowerCase().replace(/^(0x)0+/, "$1");

// devnet private key from Account #0 if generated with --seed 0
const starkKeyPair = ec.getKeyPair(
  "0x02b57c4a7fd9cf7d2c3321a753f2263e9cbf5b017227982a936638f5165aa82c"
);
const accountAddress =
  "0x23234b08ba0b9e9be710b8a0b69aa46f570d1b7452fce14003c595fc4cfbdb7";

const recieverAddress =
  "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79";

// Starknet.js currently doesn't have the functionality to calculate the class hash
const erc20ClassHash =
  "0x03f794a28472089a1a99b7969fc51cd5fbe22dd09e3f38d2bd6fa109cb3f4ecf";

const account = new Account(provider, accountAddress, starkKeyPair);

// 1. DECLARE CONTRACT

const erc20DeclareResponse = await account.declare({
  classHash: erc20ClassHash,
  contract: compiledErc20,
});

await provider.waitForTransaction(erc20DeclareResponse.transaction_hash);

console.log("erc20 contract declared");
console.log(erc20DeclareResponse);

// 2. DEPLOY CONTRACT

// Deploy an ERC20 contract and wait for it to be verified on StarkNet.
console.log("Deployment Tx - ERC20 Contract to StarkNet...");

const salt = "900080545022"; // use some random salt

const erc20Response = await account.deploy({
  classHash: erc20ClassHash,
  constructorCalldata: stark.compileCalldata({
    name: shortString.encodeShortString("TestToken"),
    symbol: shortString.encodeShortString("ERC20"),
    decimals: 18,
    initial_supply: ["1000"],
    recipient: account.address,
  }),
  salt,
});

console.log("Waiting for Tx to be Accepted on Starknet - ERC20 Deployment...");
await provider.waitForTransaction(erc20Response.transaction_hash);

const txReceipt = await provider.getTransactionReceipt(
  erc20Response.transaction_hash
);

///////////////////////////////
// Contract interaction
///////////////////////////////

// Get the erc20 contract address
const erc20Event = parseUDCEvent(txReceipt);
console.log("ERC20 Address: ", erc20Event.address);

const erc20Address = erc20Event.address;

// Create a new erc20 contract object
const erc20 = new Contract(compiledErc20.abi, erc20Address, provider);

erc20.connect(account);

// OPTION 1 - call as contract object

console.log(`Invoke Tx - Sending 10 tokens to ${recieverAddress}...`);
const { transaction_hash: mintTxHash } = await erc20.transfer(
  recieverAddress,
  ["0", "10"] // send 10 tokens as Uint256
);

// Wait for the invoke transaction to be accepted on StarkNet
console.log(`Waiting for Tx to be Accepted on Starknet - Transfer...`);
await provider.waitForTransaction(mintTxHash);

console.log(`Calling StarkNet for account balance...`);
const balanceBeforeTransfer = await erc20.balanceOf(account.address);

console.log(
  `account Address ${account.address} has a balance of:`,
  number.toBN(balanceBeforeTransfer[0].high).toString()
);

// OPTION 2 - call contract from Account

//Execute tx transfer of 10 tokens
console.log(`Invoke Tx - Transfer 10 tokens to ${recieverAddress}...`);
const executeHash = await account.execute({
  contractAddress: erc20Address,
  entrypoint: "transfer",
  calldata: stark.compileCalldata({
    recipient: recieverAddress,
    amount: ["10"],
  }),
});

console.log(`Waiting for Tx to be Accepted on Starknet - Transfer...`);
await provider.waitForTransaction(executeHash.transaction_hash);

// Check balances

// Sender
console.log(`Calling StarkNet for Sender account balance...`);
const balanceAfterTransfer = await erc20.balanceOf(account.address);

console.log(
  `account Sender ${account.address} has a balance of:`,
  number.toBN(balanceAfterTransfer[0].high).toString()
);

// Reciever
console.log(`Calling StarkNet for Reciever account balance...`);
const recieverAfterTransfer = await erc20.balanceOf(recieverAddress);

console.log(
  `account Reciever ${recieverAddress} has a balance of:`,
  number.toBN(recieverAfterTransfer[0].high).toString()
);

// NOTE: parseUDCEvent will be redundant with nevwer starknet.js version

function parseUDCEvent(txReceipt) {
  if (!txReceipt.events) {
    throw new Error("UDC emited event is empty");
  }
  const event = txReceipt.events.find(
    (it) =>
      cleanHex(it.from_address) ===
      cleanHex(
        "0x041a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf"
      ) // UDC address
  ) || {
    data: [],
  };
  return {
    transaction_hash: txReceipt.transaction_hash,
    contract_address: event.data[0],
    address: event.data[0],
    deployer: event.data[1],
    unique: event.data[2],
    classHash: event.data[3],
    calldata_len: event.data[4],
    calldata: event.data.slice(5, 5 + parseInt(event.data[4], 16)),
    salt: event.data[event.data.length - 1],
  };
}
