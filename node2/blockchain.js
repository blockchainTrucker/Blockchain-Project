const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
	constructor(fromAddress, toAddress, value, timestamp = Date.now()) {
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.value = value;
		this.timestamp = timestamp;
		this.hash = this.calculateHash().toString();
	}
	calculateHash() {
		return crypto
			.createHash('sha256')
			.update(
				this.fromAddress + this.toAddress + this.value + this.timestamp
			)
			.digest('hex');
	}

	signTransaction(privateKey) {
		const key = ec.keyFromPrivate(privateKey, 'hex');
		const sig = key.sign(this.hash, 'base64');
		this.signature = sig.toDER('hex');
		if (this.isValid()) {
			return [true, this];
		} else {
			return [false];
		}
	}

	isValid() {
		if (this.fromAddress === null) return true;

		if (!this.signature || this.signature.length === 0) {
			throw new Error('No signature in this transaction');
		}

		const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
		return publicKey.verify(this.calculateHash(), this.signature);
	}
}

class Block {
	constructor(timestamp, transactions, previousHash, nonce, miner) {
		this.previousHash = previousHash;
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.nonce = nonce;
		this.miner = miner;
		this.hash = this.calculateHash();
	}

	calculateHash() {
		return crypto
			.createHash('sha256')
			.update(
				this.previousHash +
					this.timestamp +
					JSON.stringify(this.transactions) +
					this.nonce +
					this.miner
			)
			.digest('hex');
	}

	hasValidTransactions() {
		for (const tx of this.transactions) {
			let trans = new Transaction(
				tx.fromAddress,
				tx.toAddress,
				tx.value,
				tx.timestamp
			);
			trans.signature = tx.signature;
			if (!trans.isValid()) {
				return false;
			}
		}

		return true;
	}
}

class Blockchain {
	constructor() {
		this.chain = [this.createGenesisBlock()];
		this.difficulty = 5;
		this.pendingTransactions = [];
		this.confirmedTransactions = 0;
		this.miningReward = 5000000;
		this.fee = 100;
	}

	createGenesisBlock() {
		const faucetTx = new Transaction(
			'',
			'04439e9fc23cf27a2a03d44832e8d91a695224e6c780f959da09331368ed777e6dcfccb271de346239e83082064c44507fe5f40158dc077be8f5ed9573fe393713',
			1000000000000000 * 10000
		);

		let block = new Block(Date.now(), [faucetTx], '0', 0, null);
		block.hash = block.calculateHash();
		block.index = 'genesis';

		return block;
	}

	addTransaction(transaction) {
		if (!transaction.fromAddress || !transaction.toAddress) {
			throw new Error('Transaction must include from and to address');
		}

		if (transaction.value <= 0) {
			throw new Error('Transaction amount should be higher than 0');
		}

		const walletBalance = this.safeBalanceOfAddress(
			transaction.fromAddress
		);
		if (walletBalance < transaction.amount + this.fee) {
			throw new Error('Not enough balance');
		}

		const pendingTxForWallet = this.pendingTransactions.filter(
			(tx) => tx.fromAddress === transaction.fromAddress
		);

		if (pendingTxForWallet.length > 0) {
			const totalPendingAmount = pendingTxForWallet
				.map((tx) => tx.amount)
				.reduce((prev, curr) => prev + curr);

			const totalAmount = totalPendingAmount + transaction.value;
			if (totalAmount > walletBalance) {
				throw new Error(
					'Pending transactions for this wallet is higher than its balance.'
				);
			}
		}

		this.pendingTransactions.push(transaction);
		console.log(`added to pending transactions: ${transaction.hash}`);
		return transaction;
	}

	createTransaction(data) {
		const tx = new Transaction(
			data.fromAddress,
			data.toAddress,
			data.value
		);
		const signedTx = tx.signTransaction(data.privateKey);
		if (signedTx[0] === true) {
			return this.addTransaction(signedTx[1]);
		} else {
			return 'invalid transaction';
		}
	}

	removeBlockTransactions(transactions) {
		for (const transaction of transactions) {
			for (let i = 0; i <= this.pendingTransactions.length - 1; i++) {
				if (transaction.hash === this.pendingTransactions[i].hash) {
					this.pendingTransactions.splice(i, 1);
				}
			}
		}
	}

	peerBlock(data, minerTrans) {
		let block = new Block(
			data.timestamp,
			data.transactions,
			data.previousHash,
			data.nonce,
			data.miner
		);
		let hash = block.calculateHash();
		if (hash === data.hash) {
			block.miner = data.miner;
			block.hash = hash;
			block.index = this.chain.length;
			if (block.hasValidTransactions()) {
				this.chain.push(block);
				if (block.miner === minerTrans.toAddress) {
					this.pendingTransactions.push(minerTrans);
				}
				this.removeBlockTransactions(block.transactions);
				return [true];
			}
		} else {
			return false;
		}
	}

	submitBlock(data) {
		let block = new Block(
			data.timestamp,
			data.transactions,
			data.previousHash,
			data.nonce,
			data.miner
		);
		let hash = block.calculateHash();
		if (hash === data.hash) {
			block.miner = data.miner;
			block.hash = hash;
			block.index = this.chain.length;
			if (block.hasValidTransactions()) {
				this.chain.push(block);
				this.removeBlockTransactions(block.transactions);
				let minerTrans = new Transaction(
					null,
					data.miner,
					this.miningReward
				);
				this.pendingTransactions.push(minerTrans);

				console.log(
					`adding to pending transactions: ${minerTrans.hash}`
				);
				return [true, minerTrans];
			}
		} else {
			return false;
		}
	}

	getInfo() {
		return {
			about: 'Funding Chain Coin',
			peers: this.peers,
			difficulty: this.difficulty,
			length: this.chain.length,
			pendingTransactions: this.pendingTransactions.length,
		};
	}

	debug() {
		return {
			chain: this.chain,
			pendingTransactions: this.pendingTransactions,
		};
	}

	reset() {
		this.chain = [this.createGenesisBlock()];
		return true;
	}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	getBalanceOfAddress(address) {
		let balance = 0;
		for (const block of this.chain) {
			for (const trans of block.transactions) {
				if (trans.fromAddress === address) {
					balance -= trans.value;
				}
				if (trans.toAddress === address) {
					balance += trans.value;
				}
			}
		}
		return balance;
	}

	safeBalanceOfAddress(address) {
		let balance = 0;
		for (const block of this.chain) {
			for (const trans of block.transactions) {
				if (trans.fromAddress === address) {
					balance -= trans.value;
				}
				if (trans.toAddress === address) {
					balance += trans.value;
				}
			}
		}
		for (const trans of this.pendingTransactions) {
			if (trans.fromAddress === address) {
				balance -= trans.value;
			}
		}
		return balance;
	}

	faucet(faucetAddress, toAddress, privateKey) {
		const value = 100000000;
		const tx = new Transaction(faucetAddress, toAddress, value);
		const signedTx = tx.signTransaction(privateKey);
		this.addTransaction(signedTx[1]);
		return signedTx[1];
	}

	getAllTransactionsForWallet(address) {
		const txs = [];

		for (const block of this.chain) {
			for (const tx of block.transactions) {
				if (tx.fromAddress === address || tx.toAddress === address) {
					txs.push(tx);
				}
			}
		}
		return txs;
	}

	isChainValid(newChain) {
		for (let i = 1; i < newChain.length; i++) {
			const currentBlock = new Block(
				newChain[i].timestamp,
				newChain[i].transactions,
				newChain[i].previousHash,
				newChain[i].nonce,
				newChain[i].miner
			);
			const previousBlock = new Block(
				newChain[i - 1].timestamp,
				newChain[i - 1].transactions,
				newChain[i - 1].previousHash,
				newChain[i - 1].nonce,
				newChain[i - 1].miner
			);
			if (newChain[i].hash !== currentBlock.hash) {
				return false;
			}

			if (currentBlock.previousHash !== previousBlock.hash) {
				return false;
			}
		}
		return true;
	}
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;
