# Bubble Protocol Todo List Example

Basic example of a decentralised application with private, encrypted off-chain data storage provided by [Bubble Protocol](https://github.com/Bubble-Protocol/bubble-sdk).  It's built using React and uses the Base Goerli testnet.

The dApp accepts a user 'login' by connecting a local Metamask wallet.  Each user (wallet account) has their own todo list and can add, delete and toggle tasks as 'done'.

This example uses the basic features of Bubble Protocol to demonstrate using an off-chain [bubble](https://github.com/Bubble-Protocol/bubble-sdk#bubbles) as an encrypted backup of the dApp data, in this case the todo list.  Each user (wallet account) has their own bubble that only they can access and decrypt.

The dApp is available to [try online here](https://bubbleprotocol.com/todolist).

## The DApp

The dApp is structured into `ui` and `model`.  The model contains four classes:
- `App.js` - the main application entry point and gateway for the UI. Connects the wallet and constructs and manages Sessions. Communication between UI and model is routed through the [StateManager](src/model/utils/StateManager.js).
- `Session` - each wallet account has its own task list and bubble. The Session class maintains the bubble ID and session's private key in local storage and manages the task list initialisation process, including deploying the smart contract when the task list is new.
- `TaskList` - encapsulates a session's task list and uses a bubble to store the list off-chain.  This is where you will find most of the calls to Bubble Protocol.
- `Wallet` - encapsulates a connection to a local Metamask wallet.

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