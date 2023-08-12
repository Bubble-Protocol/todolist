# Bubble Protocol Todo List Example

Basic example of a decentralised Todo List app (dApp) with private, encrypted off-chain data storage provided by [Bubble Protocol](https://github.com/Bubble-Protocol/bubble-sdk).  It's built using React and uses the Base Goerli testnet.

## The DApp

[App.js](src/model/App.js) contains all the interesting bubble calls and configuration, including deploying the contract, constructing the vault, reading a directory, encrypting/decrypting and reading & writing files.  The private key is hard coded for convenience.

## Install & Run This dApp

```
$ git clone git@github.com:Bubble-Protocol/todolist.git
$ cd todolist
$ npm install
$ npm start
```

## How To Use A Bubble In Your Own dApp

See the [Bubble Protocol SDK client package](https://github.com/Bubble-Protocol/bubble-sdk/tree/main/packages/client).

## Community

- [Discord](https://discord.gg/sSnvK5C)
- [Twitter](https://twitter.com/BubbleProtocol)

## Copyright

Copyright (c) 2023 [Bubble Protocol](https://bubbleprotocol.com)

Released under the [MIT License](LICENSE)