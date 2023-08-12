// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import Web3 from 'web3';
import { EventManager } from './utils/EventManager';

const STATES = {
  disconnected: 'disconnected',
  connected: 'connected'
}

/**
 * Wrapper for Metamask.  Provides connect, disconnect and deploy contract functions
 */
export class Wallet {

  state = STATES.disconnected;
  account;
  provider;
  listeners = new EventManager(['account-changed']);

  constructor() {
    this.provider = window.ethereum;
    this._handleAccountsChanged = this._handleAccountsChanged.bind(this);
    this.on = this.listeners.on.bind(this.listeners);
    this.off = this.listeners.off.bind(this.listeners);
  }

  async connect() {
    if (this.state !== STATES.disconnected) return Promise.reject('already connected');
    if (!this.provider) return Promise.reject('metamask is not installed');
    const accounts = await this.provider.request({ method: 'eth_requestAccounts' });
    this.account = accounts[0];
    this.provider.on('accountsChanged', this._handleAccountsChanged);
    this.state = STATES.connected;
  }

  async disconnect() {
    this.provider.off('accountsChanged', this._handleAccountsChanged);
    this.state = STATES.disconnected;
    return Promise.resolve();
  }

  async deploy(chain, abi, bytecode, args=[], options={}) {

    // switch chain if necessary
    if (this.provider.networkVersion !== ''+chain) {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x'+chain.toString(16) }],
      });
    }

    // construct web3 contract
    const web3 = new Web3(this.provider);
    const web3Contract = new web3.eth.Contract(abi);

    // deploy
    const receipt = 
      await web3Contract.deploy({ data: bytecode, arguments: args })
      .send({
        from: this.account,
        gas: 1500000,
        gasPrice: '100000000',
        ...options
      });

    // return the contract address
    return receipt.options.address;

  }

  _handleAccountsChanged(accounts) {
    console.trace('wallet account changed', accounts[0]);
    this.account = accounts[0];
    this.listeners.notifyListeners('account-changed', this.account);
  }

}