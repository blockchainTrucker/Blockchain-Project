# Blockchain-Project
Final project for my Blockchain Certification at Kingsland University

This project is split into three folders. They are Node 1, Node 2, and the Blockchain Frontend. The entire project was written in Javascript. Please ensure you have Nodejs installed to run this app. You will need to install the dependencies in each folder.

The Node folders both include an index.js, miner.js, and blockchain.js files. The miner and index files both have independent servers, but they are both started at the same time when the npm start command is given in the folder.

Each node is designed the same and each have the capabilities of connceting with each other and syncing, or starting the blockchain from from the genesis block. If you are starting the first node of the blockchain, you will need to disable the connectNode() function on line 53 of the index.js file for that particular node. if you are connecting a new node to an existing blockchain, connectNode() on line 53 will need to be active.
