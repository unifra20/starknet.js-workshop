import {
  hash,
  ec,
  stark
} from "starknet";


///// STEP 1 /////

// - Pre-calculate the address of the account contract
// - You will send ETH to this address in order to pay for the fee for account deployment
// - This is necessary because StarkNet doesn't allow free account deployments

// Generate public and private key pair.
const privateKey = stark.randomAddress(); // generate a random private key

const starkKeyPair = ec.getKeyPair(privateKey);
const starkKeyPub = ec.getStarkKey(starkKeyPair);

console.log("Private key, copy it for later: ", privateKey);

// class hash of ./Account.json. 
// Starknet.js currently doesn't have the functionality to calculate the class hash
const OZContractClassHash = '0x058d97f7d76e78f44905cc30cb65b91ea49a4b908a76703c54197bca90f81773';

const precalculatedAddress = hash.calculateContractAddressFromHash(
    starkKeyPub, // salt
    OZContractClassHash, 
    [starkKeyPub],
    0
  );
  
console.log("pre-calculated address: ", precalculatedAddress);

///// STEP 2 /////

////////////////////////////////////////////////////////////////////////////////
// IMPORTANT: 
// you need to fund your newly calculated address before you can actually deploy the account. 
//
// You can do so by using a faucet on the TESTNET:
// https://faucet.goerli.starknet.io/
//
// Or the DEVENT:
//
// curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x04a093c37ab61065d001550089b1089922212c60b34e662bb14f2f91faee2979","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"
// {"new_balance":50000000000000000000,"tx_hash":null,"unit":"wei"}
//
// ...where the address is from the newly precalculatedAddress
////////////////////////////////////////////////////////////////////////////////