const express = require('express');
const app = express();
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const crypto = require('crypto');
const PORT = 5555;
const nodeID = `http://localhost:${PORT}`;
const { Blockchain, Transaction } = require('./blockchain');
const validator = require('validator');

const coin = new Blockchain();

app.get('/info', (req, res) => {
	let info = coin.getInfo();
	info.nodeID = nodeID;
	res.send(JSON.stringify(info));
});

app.get('/debug', (req, res) => {
	let info = coin.debug();
	info.selfURL = `http://localhost:${PORT}`;
	res.send(JSON.stringify(info));
});

app.get('/reset-chain', (req, res) => {
	coin.reset();
	res.send(
		JSON.stringify({
			message: "The chain was reset to it's genesis block",
		})
	);
});

app.post('/transaction', (req, res) => {
	const transaction = req.body;
	res.send(JSON.stringify(coin.addTransaction(transaction)));
});

app.listen(PORT, () => {
	console.log(`Server running at: http://localhost:${PORT}/`);
});
