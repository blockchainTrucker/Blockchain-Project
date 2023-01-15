const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const crypto = require('crypto');
const PORT = 4444;
const nodeID = `http://localhost:${PORT}`;
const { Blockchain } = require('./blockchain');
const axios = require('axios');
const validator = require('validator');

const faucetPrivateKey =
	'1d9f52460c220ef032f0e510082c21b01c8059a503080afc5ffd1aad48efc6d8';
const faucetPublicKey =
	'04439e9fc23cf27a2a03d44832e8d91a695224e6c780f959da09331368ed777e6dcfccb271de346239e83082064c44507fe5f40158dc077be8f5ed9573fe393713';
const coin = new Blockchain();

let peers = [];
let miners = [];

const connectNode = () => {
	let requestedNode = 'http://localhost:5555';
	axios
		.post(`${requestedNode}/connect-peer`, {
			url: nodeID,
		})
		.then((res) => {
			let nodeInfo = res.data;
			console.log(nodeInfo);
			if (validator.isHash(nodeInfo[0], 'sha256')) {
				peers.push({ url: requestedNode, id: nodeInfo[0] });

				if (coin.isChainValid(nodeInfo[1])) {
					coin.chain = nodeInfo[1];
					coin.pendingTransactions = nodeInfo[2];
				}
			} else if (nodeInfo[0] === 'already connected') {
				console.log('already connected... waiting 20 seconds');
				setTimeout(() => {
					connectNode();
				}, 5000);
			} else {
				console.log('connection with node failed... waiting 5 seconds');
				setTimeout(() => {
					connectNode();
				}, 5000);
			}
		});
};

connectNode();

const calculateHash = (url) => {
	return crypto
		.createHash('sha256')
		.update(url + Date.now())
		.digest('hex');
};

const isValidSecp256k1PrivateKey = (key) => {
	try {
		crypto.createECDH('secp256k1').setPrivateKey(key, 'hex');
		return true;
	} catch (err) {
		return false;
	}
};

const getSecp256k1PublicKey = (privateKey) => {
	try {
		const ecdh = crypto.createECDH('secp256k1');
		ecdh.setPrivateKey(privateKey, 'hex');
		const publicKey = ecdh.getPublicKey();
		return publicKey.toString('hex');
	} catch (err) {
		console.log(err);
	}
};

const isValidSecp256k1PublicKey = (key) => {
	const pattern = /^04[0-9a-fA-F]{128}$/;
	return pattern.test(key);
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

app.post('/add-transaction', (req, res) => {
	const transaction = req.body;
	if (isValidSecp256k1PrivateKey(transaction.privateKey)) {
		let publicFromPrivate = getSecp256k1PublicKey(transaction.privateKey);
		if (publicFromPrivate === transaction.fromAddress) {
			if (transaction.value > 0) {
				let balance = coin.getBalanceOfAddress(transaction.fromAddress);
				if (balance > parseInt(transaction.value)) {
					if (isValidSecp256k1PublicKey(transaction.toAddress)) {
						res.send(
							JSON.stringify(coin.createTransaction(transaction))
						);
					} else {
						res.send(JSON.stringify('invalid transaction'));
					}
				} else {
					res.send(JSON.stringify('insufficient balance'));
				}
			} else {
				res.send(JSON.stringify('transaction must be greater than 0'));
			}
		} else {
			res.send(JSON.stringify('invalid transaction'));
		}
	} else {
		res.send(JSON.stringify('invalid transaction'));
	}
});

app.post('/wallet-balance', (req, res) => {
	const address = req.body.address;
	res.send(JSON.stringify(coin.getBalanceOfAddress(address)));
});

app.post('/faucet', (req, res) => {
	const address = req.body.address;
	if (isValidSecp256k1PublicKey(address)) {
		coin.faucet(faucetPublicKey, address, faucetPrivateKey);
		res.send(JSON.stringify(`sent 1 coin to ${address}`));
	} else {
		res.send(JSON.stringify(`invalid request`));
	}
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
			if (miner.url === url) {
				count++;
			}
		}
		if (count === 0) {
			let miner = { url: url, id: calculateHash(url) };
			miners.push(miner);
			console.log(miners);
			res.send(JSON.stringify(miner.id));
		} else {
			res.send(JSON.stringify('already connected'));
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
	if (
		validator.isURL(block.url, {
			require_tld: false,
			require_port: true,
		})
	) {
		let minerIndex = miners.findIndex((miner) => miner.url === block.url);
		if (minerIndex === -1) {
			res.send(JSON.stringify('not connected'));
		} else {
			if (miners[minerIndex].id === block.id) {
				if (
					block.previousHash ===
					coin.chain[coin.chain.length - 1].hash
				) {
					let submit = coin.submitBlock(block);
					if (submit[0] === true) {
						res.send(JSON.stringify(submit));
					} else {
						res.send(JSON.stringify('invalid block'));
					}
				} else {
					res.send(JSON.stringify('invalid block'));
				}
			} else {
				res.send(JSON.stringify('invalid credentials'));
			}
		}
	}
});

app.post('/connect-peer', (req, res) => {
	const url = req.body.url;
	if (
		validator.isURL(url, {
			require_tld: false,
			require_port: true,
		})
	) {
		let count = 0;
		for (const peer of peers) {
			if (peer.url === url) {
				count++;
			}
		}
		if (count === 0) {
			let peer = { url: url, id: calculateHash(url) };
			peers.push(peer);
			res.send(
				JSON.stringify([peer.id, coin.chain, coin.pendingTransactions])
			);
		} else {
			res.send(JSON.stringify(['already connected']));
		}
	} else {
		res.send(JSON.stringify('invalid URL'));
	}
});

app.listen(PORT, () => {
	console.log(`Node running at: ${nodeID}`);
});
