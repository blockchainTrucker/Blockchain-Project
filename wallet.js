const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

// Print the keys to the console
console.log('public key\n', publicKey);

console.log('private key\n', privateKey);

//wallet 1
//public key
//  0405c2c1aba1effde785707e8e53589fcdad02bf66f8e22b4dee7f602445b6ac43ea805590e107b79fcc97ac334bd534f9ee5df25ed62ad0c69d0406e4e0988d86
//  private key
//   709f645137e38edd1bf20d6aaa2e8fdc5205a870a88cc3f34efba39316e2a5a4

//wallet 2
// public key
//  045fb00e9b2402b865909a21abb26f26ac5e1522612df6f4224fe3a193fab3bc50ee845cd14b1270cb5ba6b30e80cc3165fc37fd16896775d485d949e6df5cef00
// private key
//  5a39eb9d6237bf6e44c5eb845528e021f79f9feab20e301a99b67371139baf4c

//miner 1
// public key
//  04075dbf96045f69fa43454e14f434d2abca1c450fc68ee3b00ffdc39c8f4c1a739283cd882afcee97cc556e5a286a67cf5955870272694da4d41fb4b4aa69b61b
// private key
//  3da51ea25f6f625fd645bbbb16bd5cdea2c32e22a40074a52b38276364d7185f

// miner 2
// public key
//  041ff5b39b7a9f4c0e7e09091495cb09831495a7602a745361465fb2f8c124558eb4efb2c8ebb5736c39d13d426dd4577c0ac55c67abadf36345617e5d833b822b
// private key
//  a10491ab4a02e4548f4e6c65d5e4b2bfcc9cc2de63c55a22962ab72194415976
