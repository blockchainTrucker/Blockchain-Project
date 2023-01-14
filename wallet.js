const EC = require('elliptic').ec;

// You can use any elliptic curve you want
const ec = new EC('secp256k1');

// Generate a new key pair and convert them to hex-strings
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
