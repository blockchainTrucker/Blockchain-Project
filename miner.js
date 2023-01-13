const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');
const PORT = 6000;
const validator = require('validator');
const minerURL = `http://localhost:${PORT}`;
let minerID = '';
const publicKey =
	'04439e9fc23cf27a2a03d44832e8d91a695224e6c780f959da09331368ed777e6dcfccb271de346239e83082064c44507fe5f40158dc077be8f5ed9573fe393713';
let chainData = {};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(PORT, () => {
	console.log(`Miner running at: ${minerURL}`);
});

const calculateHash = (nonce) => {
	return crypto
		.createHash('sha256')
		.update(
			chainData.previousBlockHash +
				chainData.timestamp +
				JSON.stringify(chainData.pendingTransactions) +
				nonce +
				publicKey
		)
		.digest('hex');
};

const mineBlock = async () => {
	chainData.timestamp = Date.now();
	let nonce = 0;
	let hash = '';
	while (
		hash.substring(0, chainData.difficulty) !==
		Array(chainData.difficulty + 1).join('0')
	) {
		nonce++;
		hash = calculateHash(nonce);
	}
	console.log(`Block mined: ${hash}`);

	await axios.post('http://localhost:5555/submit-new-block', {
		hash: hash,
		nonce: nonce,
		transactions: chainData.pendingTransactions,
		difficulty: chainData.difficulty,
		timestamp: chainData.timestamp,
		previousHash: chainData.previousBlockHash,
		miner: publicKey,
	});
	preCheck();
};

const preCheck = async () => {
	chainData = await axios.post('http://localhost:5555/miner-info', {
		url: minerURL,
		id: minerID,
	});
	console.log(chainData.data);
	chainData = chainData.data;
	if (chainData.pendingTransactions.length > 0) {
		mineBlock();
	} else {
		setTimeout(() => {
			preCheck();
		}, 5000);
	}
};

const connectNode = () => {
	axios
		.post('http://localhost:5555/connect-miner', {
			url: minerURL,
		})
		.then((res) => {
			if (validator.isHash(res.data, 'sha256')) {
				minerID = res.data;
				preCheck(minerID);
			} else {
				console.log('connection with node failed');
				setTimeout(() => {
					connectNode();
				}, 5000);
			}
		});
};

connectNode();
