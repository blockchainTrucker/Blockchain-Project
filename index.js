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

const node = (() => {
	const faucetPrivateKey =
		'1d9f52460c220ef032f0e510082c21b01c8059a503080afc5ffd1aad48efc6d8';
	const faucetPublicKey =
		'04439e9fc23cf27a2a03d44832e8d91a695224e6c780f959da09331368ed777e6dcfccb271de346239e83082064c44507fe5f40158dc077be8f5ed9573fe393713';
	const coin = new Blockchain();

	let peers = [];
	let miners = [];

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

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
		console.log(req.body);
		res.send(
			JSON.stringify({
				previousBlockHash: coin.getLatestBlock().hash,
				difficulty: coin.difficulty,
				pendingTransactions: coin.pendingTransactions,
			})
		);
	});

	app.listen(PORT, () => {
		console.log(`Node running at: ${nodeID}`);
	});
})();

const miner = (async () => {
	const PORT = 6000;
	const minerID = `http://localhost:${PORT}`;
	const publicKey =
		'04016bb09f05461bb1da9f1891542e3f8eb05aa5babbd97ad8d97cb23b067c8db425e6d1740b87648ef117f2b8b7348f3a75737c1c8a9b396173fa0c40449de085';

	app.use(bodyParser.urlencoded({ extended: false }));

	app.listen(PORT, () => {
		console.log(`Miner running at: ${minerID}`);
	});

	let chainData = await axios.post('http://localhost:5555/connect-miner', {
		id: minerID,
	});
	console.log(chainData.data);
})();
