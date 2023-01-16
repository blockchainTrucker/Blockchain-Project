const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');
const PORT = 5000;
const validator = require('validator');
const minerURL = `http://localhost:${PORT}`;
let minerID = '';
const publicKey =
	'041ff5b39b7a9f4c0e7e09091495cb09831495a7602a745361465fb2f8c124558eb4efb2c8ebb5736c39d13d426dd4577c0ac55c67abadf36345617e5d833b822b';
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
		.post('http://localhost:4444/submit-new-block', {
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
	chainData = await axios.post('http://localhost:4444/miner-info', {
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
		.post('http://localhost:4444/connect-miner', {
			url: minerURL,
		})
		.then((res) => {
			if (validator.isHash(res.data, 'sha256')) {
				minerID = res.data;
				preCheck();
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
