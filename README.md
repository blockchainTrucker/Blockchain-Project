# Blockchain-Project
Final project for my Blockchain Certification at Kingsland University

This project is split into three folders. They are Node 1, Node 2, and the Blockchain Frontend. The entire project was written in Javascript. Please ensure you have Nodejs installed to run this app. You will need to install the dependencies in each folder.

The Node folders both include an index.js, miner.js, and blockchain.js files. The miner and index files both have independent servers, but they are both started at the same time when the npm start command is given in the folder.

Each node is designed the same and have the capabilities of connceting with each other and syncing, or starting the blockchain from the genesis block. If you are starting the first node of the blockchain, you will need to disable the connectNode() function on line 53 of the index.js file for that particular node. If you are connecting a new node to an existing blockchain, connectNode() on line 53 will need to be active. When running, Node 1 runs on localhost:5555, Node 2 runs on localhost:4444, Miner 1 runs on localhost:6000, and Miner 2 runs on localhost:5000. 

The Blockchain Frontend is a multipage application created with React. It is an easy way to interact with the blockchain. It runs on localhost:3000 and is designed to interact with Node 1 on localhost:5555.

The home page is the block explorer. It gives you the ability to search the blockchain by transaction hash, block hash, or wallet address. It also shows the latest 10 blocks by default but also gives the ability to see the entire chain.

The faucet allows a wallet address to receive 1 coin per hour.

The Wallet allows you to create a new wallet, recover your wallet from mnemonic, and send coins.
