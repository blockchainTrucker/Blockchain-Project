const express = require('express');
const app = express();
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const crypto = require('crypto');
const PORT = 5555;
const { Blockchain, Transaction } = require('./blockchain');

const fccoin = new Blockchain();

const nodeID = crypto
	.createHash('sha256')
	.update(Date.now().toString(), 'Funding Chain Coin')
	.digest('hex');

app.get('/info', (req, res) => {
	let info = fccoin.getInfo();
	info.nodeID = nodeID;
	res.send(JSON.stringify(info));
});

app.get('/debug', (req, res) => {
	let info = fccoin.debug();
	info.selfURL = 'http://localhost:5555';
	res.send(JSON.stringify(info));
});

app.listen(PORT, () => {
	console.log(`Server running at: http://localhost:${PORT}/`);
});
