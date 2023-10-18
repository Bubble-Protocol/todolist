# Bubble Protocol Todo List Example

Basic demonstration of using private, encrypted off-chain storage in a decentralised application using [Bubble Protocol](https://github.com/Bubble-Protocol/bubble-sdk). 

This dApp is built using React and the Base Goerli testnet.  

It is available to [try online here](https://bubbleprotocol.com/todolist).

## UI Overview

1. User connects their wallet
2. User clicks the *Create* button to create their TODO list (one list per wallet account).
3. User is redirected to their wallet to deploy the TODO list's bubble. (Wallet deploys the bubble smart contract and the app constructs the bubble on the remote *vault.bubbleprotocol.com* server).
4. User can add and delete tasks, and mark them as done.
5. Switching wallet accounts automatically switches between TODO lists.

## The DApp

This example uses the basic *create*, *encryption*, *read* and *write* features of Bubble Protocol to construct an off-chain [bubble](https://github.com/Bubble-Protocol/bubble-sdk#bubbles) and use it as an encrypted backup of the dApp data, in this case the todo list.  

When the user connects their wallet, the app constructs a new 'session' with an off-chain bubble that only the user can access and decrypt.

Go straight to the [`TaskList`](./src/model/TaskList.js) class within the model to see how an encrypted bubble is constructed, read and written. 

### Architecture

The dApp is structured into `ui` and `model`.  The model contains four classes:

- [`TaskList`](./src/model/TaskList.js) - encapsulates a session's task list and bubble. Uses the bubble to store the list off-chain.  This is where you will find the calls to Bubble Protocol.
- [`App`](./src/model/App.js) - the main application entry point and gateway for the UI. Constructs and manages Sessions. Communication between UI and model is routed through the [`StateManager`](src/model/utils/StateManager.js).
- [`Session`](./src/model/Session.js) - each wallet account has its own task list and bubble. The Session class maintains the bubble ID and session's private key in local storage and manages the task list initialisation process, including deploying the smart contract when the task list is new.
- [`Wallet`](./src/model/Wallet.js) - encapsulates a connection to the user's wallet.

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