const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const PORT = 5555;
const nodeID = `http://localhost:${PORT}`;
const { Blockchain, Transaction } = require('./blockchain');
const axios = require('axios');
const validator = require('validator');
const cors = require('cors');
const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1');
const ripemd160 = require('ripemd160');
const bs58 = require('bs58');

const faucetPrivateKey =
	'886e673b75ef92cd252d7103a0a165940f1bc9f35923e1eb78ebaca54a7f1769';
const faucetAddress = 'FPYjDRvWT21XbvYxtzNC3YMVgTY';
let requestedNode = 'http://localhost:4444';
const coin = new Blockchain();
let peers = [];
let miners = [];

const connectNode = () => {
	axios
		.post(`${requestedNode}/connect-peer`, {
			url: nodeID,
		})
		.then((res) => {
			let nodeInfo = res.data;
			if (validator.isHash(nodeInfo[0], 'sha256')) {
				peers.push({ url: requestedNode, id: nodeInfo[0] });
				if (coin.isChainValid(nodeInfo[1])) {
					coin.pendingTransactions = nodeInfo[2];
					coin.chain = nodeInfo[1];
				}
			} else if (nodeInfo[0] === 'already connected') {
				console.log('already connected... waiting 20 seconds');
				setTimeout(() => {
					connectNode();
				}, 4 * 5000);
			} else {
				console.log('connection with node failed... waiting 5 seconds');
				setTimeout(() => {
					connectNode();
				}, 5000);
			}
		});
};

// connectNode();

const calculateHash = (url) => {
	return crypto
		.createHash('sha256')
		.update(url + Date.now())
		.digest('hex');
};

const isValidPrivateKey = (privateKey) => {
	console.log(privateKey);
	if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
		return false;
	}
	return true;
};

function isValidAddress(address) {
	if (!/^[1-9A-HJ-NP-Za-km-z]{27,35}$/.test(address)) {
		console.log(false);
		return false;
	}
	return true;
}

const getAddress = (privateKey) => {
	const publicKey = ec.keyFromPrivate(privateKey).getPublic().encode('hex');
	console.log('public key', publicKey);

	const hashedPublicKey = new ripemd160()
		.update(Buffer.from(publicKey, 'hex'))
		.digest();
	const encodedHashedPublicKey = bs58.encode(new Uint8Array(hashedPublicKey));
	console.log(encodedHashedPublicKey.toString('hex'));
	return encodedHashedPublicKey;
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

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
	if (isValidPrivateKey(transaction.privateKey)) {
		let addressFromPrivate = getAddress(transaction.privateKey);
		console.log(transaction.fromAddress);
		if (addressFromPrivate === transaction.fromAddress) {
			if (transaction.value > 0) {
				let balance = coin.getBalanceOfAddress(transaction.fromAddress);
				if (balance > parseInt(transaction.value)) {
					if (isValidAddress(transaction.toAddress)) {
						let tx = coin.createTransaction(transaction);
						for (let i = 0; i < peers.length; i++) {
							axios
								.post(`${peers[i].url}/peer-transaction`, {
									transaction: tx,
									url: nodeID,
									id: peers[i].id,
								})
								.then(() => {})
								.catch(() => {
									peers.splice(peers[(i, 1)]);
									console.log(
										`no response from ${peers[i].url}`
									);
								});
						}
						res.send(JSON.stringify(tx.hash));
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
			res.send(JSON.stringify('invalid transaction 2'));
		}
	} else {
		res.send(JSON.stringify('invalid transaction'));
	}
});

app.post('/peer-transaction', (req, res) => {
	let reqTx = req.body.transaction;
	let peerData = { url: req.body.url, id: req.body.id };
	let peerIndex = peers.findIndex((peer) => peer.url === peerData.url);
	if (peerIndex === -1) {
		res.send(JSON.stringify('not connected'));
	} else if (peers[peerIndex].id === peerData.id) {
		let transIndex = coin.pendingTransactions.findIndex(
			(trans) => trans.hash === reqTx.hash
		);
		if (transIndex >= 0) {
			res.send(
				JSON.stringify('transaction exists on pending transactions')
			);
		} else {
			for (const block of coin.chain) {
				let transIndex = block.transactions.findIndex(
					(trans) => trans.hash === reqTx.hash
				);
				if (transIndex >= 0) {
					console.log('transaction already on chain');
					res.send(JSON.stringify('transaction already on chain'));
				}
			}
			for (const transaction of coin.pendingTransactions) {
				if (transaction.hash === reqTx.hash) {
					console.log('transaction already pending');
					res.send(JSON.stringify('transaction already pending'));
				}
			}
			coin.pendingTransactions.push(reqTx);
			console.log('transaction added');
			res.send(JSON.stringify('transaction added'));
		}
	} else {
		console.log('invalid credentials');
		res.send(JSON.stringify('invalid credentials'));
	}
});

app.post('/wallet-balance', (req, res) => {
	const address = req.body.address;
	res.send(JSON.stringify(coin.getBalanceOfAddress(address)));
});

app.post('/faucet', (req, res) => {
	const address = req.body.address;
	if (isValidAddress(address)) {
		for (const block of coin.chain) {
			for (const transaction of block.transactions) {
				if (transaction.fromAddress === faucetAddress) {
					if (transaction.toAddress === address) {
						if (
							Date.now() - transaction.timestamp <
							1000 * 60 * 60
						) {
							res.send(JSON.stringify([false, 'time limit']));
							return;
						}
					}
				}
			}
		}
		let transaction = coin.faucet(faucetAddress, address, faucetPrivateKey);
		for (let i = 0; i < peers.length; i++) {
			axios
				.post(`${peers[i].url}/peer-transaction`, {
					transaction: transaction,
					url: nodeID,
					id: peers[i].id,
				})
				.then(() => {})
				.catch(() => {
					console.log(`no response from ${peers[i].url}`);
					peers.splice(peers[(i, 1)]);
				});
		}
		res.send(JSON.stringify([true, `success`]));
	} else {
		res.send(JSON.stringify([false, `invalid address`]));
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
						for (let i = 0; i < peers.length; i++) {
							axios
								.post(`${peers[i].url}/peer-block`, {
									block: block,
									url: nodeID,
									id: peers[i].id,
									minerTrans: submit[1],
								})
								.then(() => {})
								.catch(() => {
									console.log(
										`no response from ${peers[i].url}`
									);
									peers.splice(peers[(i, 1)]);
								});
						}
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

app.post('/peer-block', (req, res) => {
	let block = req.body.block;
	let minerTrans = req.body.minerTrans;
	let peerData = { url: req.body.url, id: req.body.id };

	if (
		validator.isURL(block.url, {
			require_tld: false,
			require_port: true,
		})
	) {
		let peerIndex = peers.findIndex((peer) => peer.url === peerData.url);
		if (peerIndex === -1) {
			res.send(JSON.stringify('not connected'));
		} else {
			if (peers[peerIndex].id === peerData.id) {
				if (
					block.previousHash ===
					coin.chain[coin.chain.length - 1].hash
				) {
					let submit = coin.peerBlock(block, minerTrans);
					if (submit[0] === true) {
						res.send(JSON.stringify(submit));
					} else {
						console.log('invalid block');
						res.send(JSON.stringify('invalid block'));
					}
				} else if (
					block.hash === coin.chain[coin.chain.length - 1].hash
				) {
					res.send(JSON.stringify('block already added'));
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

app.get('/recent-blocks', (req, res) => {
	let currentChain = coin.chain;
	if (currentChain.length >= 10) {
		let recentBlocks = [];
		for (let i = currentChain.length - 10; i < currentChain.length; i++) {
			recentBlocks.push(currentChain[i]);
		}
		res.send(JSON.stringify(recentBlocks));
	} else {
		res.send(JSON.stringify(coin.chain));
	}
});

app.post('/hash-search', (req, res) => {
	const hash = req.body.hash;
	console.log(hash);
	for (const block of coin.chain) {
		if (block.hash == hash) {
			res.send(JSON.stringify([true, 'block', block]));
			return;
		}
		for (let i = 0; i < block.transactions.length; i++) {
			if (block.transactions[i].hash == hash) {
				res.send(JSON.stringify([true, 'tx', block.transactions[i]]));
				return;
			}
		}
	}
	res.send(JSON.stringify([false]));
});

app.listen(PORT, () => {
	console.log(`Node running at: ${nodeID}`);
});
