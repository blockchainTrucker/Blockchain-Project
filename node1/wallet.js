const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1');
const ripemd160 = require('ripemd160');
const crypto = require('crypto');
const hdkey = require('hdkey');
const bip39 = require('bip39');
const bs58 = require('bs58');
const bitcoin = require('bitcoinjs-lib');

// Generate a new master private key
// const mnemonic = bip39.generateMnemonic();
// console.log('mnemonic', mnemonic);
// const seed = bip39.mnemonicToSeedSync(mnemonic);
// const hdwallet = hdkey.fromMasterSeed(seed);

// // Derive the first BIP32 child
// const child1 = hdwallet.derive("m/44'/0'/0'/0/0");

// // Get the private key
// const privateKey = child1.privateKey;
// console.log('private key', privateKey.toString('hex'));

// // Get the public key
// const publicKey = ec.keyFromPrivate(privateKey).getPublic().encode('hex');
// console.log('public key', publicKey);
// const hashedPublicKey = new ripemd160()
// 	.update(Buffer.from(publicKey, 'hex'))
// 	.digest();
// console.log('hashed public key', hashedPublicKey.toString('hex'));

// const ripemd160Hash = crypto
// 	.createHash('ripemd160')
// 	.update(crypto.createHash('sha256').update(publicKey).digest())
// 	.digest();

// // Add version byte and checksum to create the address
// let versionByte = new Uint8Array([0x00]);
// let payload = Buffer.concat([versionByte, ripemd160Hash]);
// let checksum = crypto
// 	.createHash('sha256')
// 	.update(crypto.createHash('sha256').update(payload).digest())
// 	.digest()
// 	.slice(0, 4);
// let address = bs58.encode(Buffer.concat([payload, checksum]));
// // let address = bs58.encode(Buffer.from(ripemd160Hash));
// console.log('address', address);

// let decoded = Buffer.from(bs58.decode(address));
// console.log('decoded address', decoded.toString('hex'));
const decoded = bs58.decode('FPYjDRvWT21XbvYxtzNC3YMVgTY');
const publicKeyHash = decoded.slice(1, decoded.length - 4);

// obtain the public key from the public key hash
const publicKey = publicKeyHash; // (implementation not shown)

const verifier = crypto.createVerify('sha256');
verifier.update(
	'02eef292c9bad4cf6ec42b5182da4c43cc567a37145c5e9bc986fb63a3a09747'
);
const isValid = verifier.verify(
	publicKey,
	'304502204c3aa2f369a0a53e0418251bc4bf7feda1e61c1a2d85de8e32ce3871f8886f0902210087f85c9eaec443821b9057551057bcf49f3fb4ef0ee96c7f132891958bdaf9f8',
	'hex'
);
console.log(isValid);
// let revchecksum = checksum;
// let newChecksum = crypto
// 	.createHash('sha256')
// 	.update(crypto.createHash('sha256').update(payload).digest())
// 	.digest()
// 	.slice(0, 4);

// if (revchecksum.toString('hex') !== newChecksum.toString('hex')) {
// 	console.error('Invalid address: checksum does not match');
// 	return;
// }

// let revhashedPublicKey = payload.slice(1);
// console.log('hashed public key', revhashedPublicKey.toString('hex'));

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
