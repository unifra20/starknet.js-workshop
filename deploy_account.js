import fs from "fs";

// Install the latest version of starknet with npm install starknet@next and import starknet
import {
  defaultProvider,
  ec,
  json,
  stark,
  SequencerProvider,
} from "starknet";

const provider = process.env.STARKNET_PROVIDER_BASE_URL === undefined ?
  defaultProvider :
  new SequencerProvider({ baseUrl: process.env.STARKNET_PROVIDER_BASE_URL });

console.log("Reading OpenZeppelin Account Contract...");
const compiledOZAccount = json.parse(
  fs.readFileSync("./OZAccount.json").toString("ascii")
);

// Since there are no Externally Owned Accounts (EOA) in StarkNet,
// all Accounts in StarkNet are contracts.

// Unlike in Ethereum where a account is created with a public and private key pair,
// StarkNet Accounts are the only way to sign transactions and messages, and verify signatures.
// Therefore a Account - Contract interface is needed.

// Generate public and private key pair.
const privateKey = stark.randomAddress();

const starkKeyPair = ec.genKeyPair(privateKey);
const starkKeyPub = ec.getStarkKey(starkKeyPair);

// // Deploy the Account contract and wait for it to be verified on StarkNet.
console.log("Deployment Tx - Account Contract to StarkNet...");
const accountResponse = await provider.deployContract({
  contract: compiledOZAccount,
  constructorCalldata: [starkKeyPub],
  addressSalt: starkKeyPub,
});

// If using testnet, you can also check this address on https://starkscan.co/
console.log("Account address ", accountResponse.contract_address);

// Wait for the deployment transaction to be accepted on StarkNet
console.log(
  "Waiting for Tx to be Accepted on Starknet - OpenZeppelin Account Deployment..."
);
await provider.waitForTransaction(accountResponse.transaction_hash);


////////////////////////////////////////////////////////////////////////////////
// IMPORTANT: 
// you need to fund your newly created account before you use it. 
//
// You can do so by using a faucet on the TESTNET:
// https://faucet.goerli.starknet.io/
//
// Or the DEVENT:
//
// curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x04a093c37ab61065d001550089b1089922212c60b34e662bb14f2f91faee2979","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"
// {"new_balance":50000000000000000000,"tx_hash":null,"unit":"wei"}
//
// ...where the address is from the newly deployed account
////////////////////////////////////////////////////////////////////////////////
