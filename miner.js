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
	'04075dbf96045f69fa43454e14f434d2abca1c450fc68ee3b00ffdc39c8f4c1a739283cd882afcee97cc556e5a286a67cf5955870272694da4d41fb4b4aa69b61b';
let chainData = {};
let transList = [];
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

	await axios
		.post('http://localhost:5555/submit-new-block', {
			hash: hash,
			nonce: nonce,
			transactions: chainData.pendingTransactions,
			difficulty: chainData.difficulty,
			timestamp: chainData.timestamp,
			previousHash: chainData.previousBlockHash,
			miner: publicKey,
			url: minerURL,
			id: minerID,
		})
		.then((res) => {
			if (res.data[0] === true) {
				transList.push(res.data[1]);
				preCheck();
			} else if (res === 'invalid credentials') {
				connectNode();
			} else {
				preCheck();
			}
		});
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

setTimeout(() => {
	connectNode();
}, 5000);
