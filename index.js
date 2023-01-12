const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const crypto = require('crypto');
const PORT = 5555;
const nodeID = `http://localhost:${PORT}`;
const { Blockchain, Transaction } = require('./blockchain');
const axios = require('axios');
const miner = require('./miner');
const validator = require('validator');

const faucetPrivateKey =
	'1d9f52460c220ef032f0e510082c21b01c8059a503080afc5ffd1aad48efc6d8';
const faucetPublicKey =
	'04439e9fc23cf27a2a03d44832e8d91a695224e6c780f959da09331368ed777e6dcfccb271de346239e83082064c44507fe5f40158dc077be8f5ed9573fe393713';
const coin = new Blockchain();

let peers = [];
let miners = [];

const calculateHash = (url) => {
	return crypto
		.createHash('sha256')
		.update(url + Date.now())
		.digest('hex');
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/info', (req, res) => {
	let info = coin.getInfo();
	info.nodeID = nodeID;
	res.send(JSON.stringify(info));
});

app.get('/debug', (req, res) => {
	let info = coin.debug();
	info.miners = miners;
	info.peers = peers;
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

app.get('/chain', (req, res) => {
	res.send(JSON.stringify(coin.chain));
});

app.post('/transaction', (req, res) => {
	const transaction = req.body;
	res.send(JSON.stringify(coin.addTransaction(transaction)));
});

app.post('/wallet-balance', (req, res) => {
	const address = req.body.address;
	res.send(JSON.stringify(coin.getBalanceOfAddress(address)));
});

app.post('/faucet', (req, res) => {
	const address = req.body.address;
	coin.faucet(faucetPublicKey, address, faucetPrivateKey);
	res.send(JSON.stringify(`sent 1 coin to ${address}`));
});

app.get('/pending-transactions', (req, res) => {
	res.send(JSON.stringify(coin.pendingTransactions));
});

app.post('/connect-miner', (req, res) => {
	const url = req.body.url;
	if (
		validator.isURL(url, {
			require_tld: false,
			require_port: true,
		})
	) {
		let count = 0;
		for (const miner of miners) {
			if (miner === id) {
				count++;
			}
		}
		let miner = { url: url, id: calculateHash(url) };
		if (count === 0) {
			miners.push(miner);
			res.send(JSON.stringify(miner.id));
		}
	} else {
		res.send(JSON.stringify('invalid URL'));
	}
});

app.post('/miner-info', (req, res) => {
	let minerData = req.body;
	let minerIndex = miners.findIndex((miner) => miner.url === minerData.url);
	if (minerIndex === -1) {
		res.send(JSON.stringify('not connected'));
	} else if (miners[minerIndex].id === minerData.id) {
		res.send(
			JSON.stringify({
				previousBlockHash: coin.getLatestBlock().hash,
				difficulty: coin.difficulty,
				pendingTransactions: coin.pendingTransactions,
			})
		);
	} else {
		res.send(JSON.stringify('invalid credentials'));
	}
});

app.post('/submit-new-block', (req, res) => {
	let block = req.body;
	coin.submitBlock(block);
	res.send(JSON.stringify(req.body.hash));
});

app.listen(PORT, () => {
	console.log(`Node running at: ${nodeID}`);
});
