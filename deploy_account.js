import fs from "fs";

import { Account, RpcProvider, defaultProvider, ec, json } from "starknet";

// SETUP

const provider =
  process.env.STARKNET_NODE_PROVIDER_URL === undefined
    ? defaultProvider
    : new RpcProvider({ nodeUrl: process.env.STARKNET_NODE_PROVIDER_URL });

console.log("Reading OpenZeppelin Account Contract...");

const compiledOZAccount = json.parse(
  fs.readFileSync("./Account.json").toString("ascii")
);

// class hash of ./Account.json.
// Starknet.js currently doesn't have the functionality to calculate the class hash
const OZContractClassHash =
  "0x058d97f7d76e78f44905cc30cb65b91ea49a4b908a76703c54197bca90f81773";

///////////////////////////////////////////////////////////////////
// Since there are no Externally Owned Accounts (EOA) in StarkNet,
// all Accounts in StarkNet are contracts.

// Unlike in Ethereum where a account is created with a public and private key pair,
// StarkNet Accounts are the only way to sign transactions and messages, and verify signatures.
// Therefore a Account - Contract interface is needed.
///////////////////////////////////////////////////////////////////

///// STEP 3 - optional /////
// Declare account contract IF IT HAS NOT ALREADY BEEN DECLARED BEFORE

// NOTE: This step will fail if you haven't sent funds to the predeployed address in STEP 1

// We need to use an already deployed account in order to declare ours.
// StarkNet will always have at least 1 already declared/deployed account for this purpose.
// In our case we will use the devnet's predeployed OZ account, after you start the devnet with: `starknet-devnet --seed 0`

// const devnetPrivateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
// const devnetAccount0Address =
//   "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
// const devnetKeyPair = ec.getKeyPair(devnetPrivateKey);

// const predeployedAccount = new Account(
//   provider,
//   devnetAccount0Address,
//   devnetKeyPair
// );

// const declareTx = await predeployedAccount.declare({
//   classHash: OZContractClassHash,
//   contract: compiledOZAccount,
// });

// await provider.waitForTransaction(declareTx.transaction_hash);

// console.log("account declared");
// console.log(declareTx);

///// STEP 4 /////
// Deploy account contract
// NOTE: This step will fail if you haven't sent funds to the predeployed address in STEP 1

const precalculatedAddress =
  "0x23234b08ba0b9e9be710b8a0b69aa46f570d1b7452fce14003c595fc4cfbdb7"; // get from step 1
const privateKey =
  "0x02b57c4a7fd9cf7d2c3321a753f2263e9cbf5b017227982a936638f5165aa82c"; // get from step 1
const starkKeyPair = ec.getKeyPair(privateKey);
const starkKeyPub = ec.getStarkKey(starkKeyPair);

const account = new Account(provider, precalculatedAddress, starkKeyPair);

const accountResponse = await account.deployAccount({
  classHash: OZContractClassHash,
  constructorCalldata: [starkKeyPub],
  contractAddress: precalculatedAddress,
  addressSalt: starkKeyPub,
});

await provider.waitForTransaction(accountResponse.transaction_hash);
console.log(accountResponse);
