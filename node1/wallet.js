const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1');
const ripemd160 = require('ripemd160');
const bs58 = require('bs58');
const crypto = require('crypto');
const hdkey = require('hdkey');
const bip39 = require('bip39');
const { create } = require('domain');

// Generate a new master private key
const mnemonic = bip39.generateMnemonic();
const seed = bip39.mnemonicToSeedSync(mnemonic);
const hdwallet = hdkey.fromMasterSeed(seed);

// Derive the first BIP32 child
const child1 = hdwallet.derive("m/44'/0'/0'/0/0");

// Get the private key
const privateKey = child1.privateKey;
console.log('private key', privateKey.toString('hex'));

// Get the public key
const publicKey = ec.keyFromPrivate(privateKey).getPublic().encode('hex');
console.log('public key', publicKey);
// const hashedPublicKey = new ripemd160()
// 	.update(Buffer.from(publicKey, 'hex'))
// 	.digest();
// console.log(hashedPublicKey.toString('hex'));
// const address = bs58.encode(new Uint8Array(hashedPublicKey));
// console.log(address.toString('hex'));
// const buffer = Buffer.from(decoded);
// const hex = buffer.toString('hex');
// console.log(hex);
const getPublic = (address) => {
	let decodedAddress = new Uint8Array(bs58.decode(address));

	// Remove version byte and checksum
	let publicKeyHash = decodedAddress.slice(1, -4);

	// Reverse SHA-256
	let revsha256 = crypto.createHash('sha256');
	let revsha256Hash = revsha256.update(Buffer.from(publicKeyHash)).digest();

	// Reverse RIPEMD-160
	let revripemd160 = crypto.createHash('ripemd160');
	let revripemd160Hash = revripemd160
		.update(Buffer.from(revsha256Hash))
		.digest();

	console.log(revripemd160Hash.toString('hex'));
};

const createAddress = (publicKey) => {
	let sha256 = crypto.createHash('sha256');
	let sha256Hash = sha256.update(Buffer.from(publicKey, 'hex')).digest();

	// Hash the result of SHA-256 using RIPEMD-160
	let ripe = crypto.createHash('ripemd160');
	let ripemd160Hash = ripe.update(Buffer.from(sha256Hash)).digest();

	// Add version byte and checksum to create the address
	let versionByte = new Uint8Array([0x00]);
	let payload = Buffer.concat([versionByte, ripemd160Hash]);
	let checksum = crypto
		.createHash('sha256')
		.update(crypto.createHash('sha256').update(payload).digest())
		.digest()
		.slice(0, 4);
	let address = bs58.encode(Buffer.concat([payload, checksum]));
	console.log(address);
	getPublic(address);
};
createAddress(publicKey);

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
