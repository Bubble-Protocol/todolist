// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import Web3 from 'web3';

const STATES = {
  disconnected: 'disconnected',
  connected: 'connected'
}

/**
 * Wrapper for Metamask.  Provides connect, disconnect and deploy contract functions
 */
export class Wallet {

  state = STATES.disconnected;
  provider;

  constructor() {
    this.provider = window.ethereum;
  }

  async connect() {
    if (!this.provider) return Promise.reject('metamask is not installed');
    await this.provider.request({ method: 'eth_requestAccounts' });
    this.state = STATES.connected;
  }

  async disconnect() {
    this.state = STATES.disconnected;
    return Promise.resolve();
  }

  async deploy(chain, abi, bytecode, args=[], options={}) {

    const accounts = await this.provider.request({ method: 'eth_requestAccounts' });

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
        from: accounts[0],
        gas: 1500000,
        gasPrice: '100000000',
        ...options
      });

    // return the contract address
    return receipt.options.address;

  }

}