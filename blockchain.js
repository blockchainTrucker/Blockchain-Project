const crypto = require('crypto');
const { threadId } = require('worker_threads');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
	constructor(fromAddress, toAddress, amount) {
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
		this.timestamp = Date.now();
	}
	calculateHash() {
		return crypto
			.createHash('sha256')
			.update(
				this.fromAddress + this.toAddress + this.amount + this.timestamp
			)
			.digest('hex');
	}

	signTransaction(signingKey) {
		if (signingKey.getPublic('hex') !== this.fromAddress) {
			throw new Error('You cannot sign transactions for other wallets!');
		}

		const hashTx = this.calculateHash();
		const sig = signingKey.sign(hashTx, 'base64');

		this.signature = sig.toDER('hex');
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
	constructor(timestamp, transactions, previousHash = '') {
		this.previousHash = previousHash;
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.nonce = 0;
		this.hash = this.calculateHash();
	}

	calculateHash() {
		return crypto
			.createHash('sha256')
			.update(
				this.previousHash +
					this.timestamp +
					JSON.stringify(this.transactions) +
					this.nonce
			)
			.digest('hex');
	}

	mineBlock(difficulty) {
		while (
			this.hash.substring(0, difficulty) !==
			Array(difficulty + 1).join('0')
		) {
			this.nonce++;
			this.hash = this.calculateHash();
		}

		console.log(`Block mined: ${this.hash}`);
	}

	hasValidTransactions() {
		for (const tx of this.transactions) {
			if (!tx.isValid()) {
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
	}

	createGenesisBlock() {
		return new Block(Date.parse('2022-12-14'), [], '0');
	}

	getInfo() {
		return {
			about: 'Funding Chain Coin',
			peers: null,
			difficulty: this.difficulty,
			length: this.chain.length,
			confirmedTransactions: this.confirmedTransactions,
			pendingTransactions: this.pendingTransactions.length,
		};
	}

	debug() {}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	minePendingTransactions(miningRewardAddress) {
		const rewardTx = new Transaction(
			null,
			miningRewardAddress,
			this.miningReward
		);
		this.pendingTransactions.push(rewardTx);

		const block = new Block(
			Date.now(),
			this.pendingTransactions,
			this.getLatestBlock().hash
		);
		block.mineBlock(this.difficulty);

		console.log('Block successfully mined!');
		this.chain.push(block);
		this.confirmedTransactions = this.confirmedTransactions +=
			this.pendingTransactions.length;
		this.pendingTransactions = [];
	}

	addTransaction(transaction) {
		if (!transaction.fromAddress || !transaction.toAddress) {
			throw new Error('Transaction must include from and to address');
		}

		if (!transaction.isValid()) {
			throw new Error('Cannot add invalid transaction to chain');
		}

		if (transaction.amount <= 0) {
			throw new Error('Transaction amount should be higher than 0');
		}

		const walletBalance = this.getBalanceOfAddress(transaction.fromAddress);
		if (walletBalance < transaction.amount) {
			throw new Error('Not enough balance');
		}

		const pendingTxForWallet = this.pendingTransactions.filter(
			(tx) => tx.fromAddress === transaction.fromAddress
		);

		if (pendingTxForWallet.length > 0) {
			const totalPendingAmount = pendingTxForWallet
				.map((tx) => tx.amount)
				.reduce((prev, curr) => prev + curr);

			const totalAmount = totalPendingAmount + transaction.amount;
			if (totalAmount > walletBalance) {
				throw new Error(
					'Pending transactions for this wallet is higher than its balance.'
				);
			}
		}

		this.pendingTransactions.push(transaction);
		console.log('transaction added: %s', transaction);
	}

	getBalanceOfAddress(address) {
		let balance = 0;

		for (const block of this.chain) {
			for (const trans of block.transactions) {
				if (trans.fromAddress === address) {
					balance -= trans.amount;
				}

				if (trans.toAddress === address) {
					balance += trans.amount;
				}
			}
		}

		console.log('getBalanceOfAdrees: %s', balance);
		return balance;
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

		console.log('get transactions for wallet count: %s', txs.length);
		return txs;
	}

	isChainValid() {
		const realGenesis = JSON.stringify(this.createGenesisBlock());

		if (realGenesis !== JSON.stringify(this.chain[0])) {
			return false;
		}

		for (let i = 1; i < this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			if (previousBlock.hash !== currentBlock.previousHash) {
				return false;
			}

			if (!currentBlock.hasValidTransactions()) {
				return false;
			}

			if (currentBlock.hash !== currentBlock.calculateHash()) {
				return false;
			}
		}

		return true;
	}
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;
