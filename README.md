# Bubble Protocol Todo List Example

Basic example of a decentralised application with private, encrypted off-chain data storage provided by [Bubble Protocol](https://github.com/Bubble-Protocol/bubble-sdk).  It's built using React and uses the Base Goerli testnet.

Each connected wallet account has its own separate todo list.  The user can add, delete and toggle tasks as 'done'.

This example uses the basic features of Bubble Protocol to demonstrate using an off-chain [bubble](https://github.com/Bubble-Protocol/bubble-sdk#bubbles) as an encrypted backup of the dApp data, in this case the todo list.  Each todo list has its own bubble that only the user can access and decrypt.

The dApp is available to [try online here](https://bubbleprotocol.com/todolist).

## The DApp

The dApp is structured into `ui` and `model`.  The model contains four classes:
- `TaskList` - encapsulates a session's task list and uses a bubble to store the list off-chain.  This is where you will find most of the calls to Bubble Protocol.
- `App.js` - the main application entry point and gateway for the UI. Constructs and manages Sessions. Communication between UI and model is routed through the [StateManager](src/model/utils/StateManager.js).
- `Session` - each wallet account has its own task list and bubble. The Session class maintains the bubble ID and session's private key in local storage and manages the task list initialisation process, including deploying the smart contract when the task list is new.
- `Wallet` - encapsulates a connection to the user's wallet.

## Install & Run This dApp

```
$ git clone git@github.com:Bubble-Protocol/todolist.git
$ cd todolist
$ npm install
$ npm start
```

## Using WalletConnect

This dApp uses [RainbowKit](https://www.rainbowkit.com/) to provide its wallet connectivity. If you want to connect your wallet via [WalletConnect](https://walletconnect.com/) then add your `WalletConnect` Project ID to [src/rainbow-kit.js](./src/rainbow-kit.js).

## How To Use A Bubble In Your Own dApp

See the [Bubble Protocol SDK client package](https://github.com/Bubble-Protocol/bubble-sdk/tree/main/packages/client).

## Community

- [Discord](https://discord.gg/sSnvK5C)
- [Twitter](https://twitter.com/BubbleProtocol)

## Copyright

Copyright (c) 2023 [Bubble Protocol](https://bubbleprotocol.com)

Released under the [MIT License](LICENSE)