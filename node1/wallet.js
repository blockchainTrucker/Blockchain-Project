const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1');
const ripemd160 = require('ripemd160');
const bs58 = require('bs58');
const crypto = require('crypto');
const hdkey = require('hdkey');

// Generate a new master private key
const seed = crypto.randomBytes(32);
const hdwallet = hdkey.fromMasterSeed(seed);

// Derive the first BIP32 child
const child1 = hdwallet.derive("m/44'/0'/0'/0/0");

// Get the private key
const privateKey = child1.privateKey;
console.log('private key', privateKey.toString('hex'));

// Get the public key
const publicKey = ec.keyFromPrivate(privateKey).getPublic().encode('hex');
console.log('public key', publicKey);

const hashedPublicKey = new ripemd160()
	.update(Buffer.from(publicKey, 'hex'))
	.digest();
console.log(hashedPublicKey.toString('hex'));
const encodedHashedPublicKey = bs58.encode(new Uint8Array(hashedPublicKey));
console.log(encodedHashedPublicKey.toString('hex'));

const decoded = bs58.decode(encodedHashedPublicKey);
const buffer = Buffer.from(decoded);

const hex = buffer.toString('hex');
console.log(hex);
// faucet
// 886e673b75ef92cd252d7103a0a165940f1bc9f35923e1eb78ebaca54a7f1769
// FPYjDRvWT21XbvYxtzNC3YMVgTY

// wallet 1
// 751ef73df77484ed1977e5deb6ba83e5636673314dff16143f58f8fcf94dfe7f
// 3pALvweNqCJtvj8APBxqJG8ixXLU

// wallet 2
// 4c5583ab08430ff951c905e151bb3482e52ca0428d1127b3e6ab6a20348f155e
// 2ECcX8Z8kmwouoHzsfEs6qb4igDM

// miner 1
// d06c0bd9acbe896f1cad9a49017d86936cd19bdeaf59d18ce641f30a0f05d598
// 2MW8V7hjQWTmTC2HrN7NxqJipX3k

// miner 2
// 0729b691a1fcfeef8f48f6b8890285e4b271db923a9e1d6f97f336f8bb1d5b3a
// 2Lz8CoFCDHSZtzBBZWPDJej4oJ9x
