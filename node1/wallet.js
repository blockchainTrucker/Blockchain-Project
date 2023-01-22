const bip39 = require('bip39');
const crypto = require('crypto');
const hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');

const randomSeed = crypto.randomBytes(32);
const mnemonic = bip39.entropyToMnemonic(randomSeed);
console.log(mnemonic);
const seed = bip39.mnemonicToSeedSync(mnemonic);
const hdwallet = hdkey.fromMasterSeed(seed);
// console.log(hdwallet.privateKey.toString('hex'));
// console.log(hdwallet.publicKey.toString('hex'));
const path = "m/44'/60'/0'/0/0";
const privateKeyBuffer = hdwallet.derive(path).privateKey;
const privateKeyHex = privateKeyBuffer.toString('hex');
console.log(privateKeyHex);
const publicKeyBuffer = ethUtil.privateToPublic(privateKeyBuffer);
const address = ethUtil.publicToAddress(publicKeyBuffer).toString('hex');
console.log(address);
