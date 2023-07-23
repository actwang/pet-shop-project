# pet-shop-project
This is our group's final project. We carefully picked out 5 features we thought would be most benficial to our users and updated the application accordingly. This document serves as a detailed instruction file explaining the setup and running process of the DApp.

## Specifications
The project uses the javascript web3 library and includes all required libraries in package.json. The project uses some level of jQuery, and does not employ other frameworks like React or Vue. 

Node.js version: v18.16.0
lite-server version: v2.3.0
Solidity version: v0.5.16 (solc-js)
web3 version: v1.2.1
Truffle version: v5.1.10 (core: 5.1.10)
Ganache version:  v2.7.1
Frontend: JQuery


# Running
To run our app, first download Ganche, a personal development blockchain server for local contract deployment and testing. To download Ganche, navigate to https://trufflesuite.com/ganache and click on Download.

Next, we need truffle to compile and migrate our contracts. To install truffle cli, run:
```npm install -g truffle```
For a list of instructions, run truffle help.
Navigate to our source folder. To install all dependencies, run:

```npm i ```

Now that the local environment has all required dependencies, run 
```truffle compile```
to compile the smart contract. After downloading Ganache, double cilck the icon, this will generate a locally running blockchain on port 7545.
Now run
```truffle migrate```
to deploy our contracts.

The easiest way to interact with the dapp is through Metamask. Install the Metamask extension form your desired browser, create an account, and copy the seed phrase into Metamask to connect to the dapp running on port 7545. This would be running as http://localhost:7545 as a new custom RPC network. 

Finally, to run the frontend application, run 
```npm run dev```
This will start the frontend server to display UI and let you interact with the page and adopt pets. 

Refer to our demo video for a walk-through of our newly implemented features. 