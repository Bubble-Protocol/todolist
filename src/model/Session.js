// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import * as contractSourceCode from './contracts/TodoListBubble.json';
import { ecdsa } from '@bubble-protocol/crypto';
import { ContentId, assert } from '@bubble-protocol/core';
import { TaskList } from './TaskList';

const STATE_VERSION = 2;

/**
 * A Session is an instance of the app with a locally saved state. The local device can support
 * multiple sessions allowing the user to have different TODO Lists for different wallet accounts.
 * 
 * The Session is identified by its ID, passed in the constructor. The state is saved to 
 * localStorage with the Session ID as the key name.
 * 
 * The Session is responsible for initialising the task list, including deploying the smart 
 * contract and constructing the bubble if they haven't been created before.  The bubble itself
 * is encapsulated in the TaskList class.
 */
export class Session {

  /**
   * @dev The session private key, held in local storage and read on construction.
   */
  key;

  /**
   * @dev The session's off-chain bubble id. Held in local storage and read on construction.
   */
  bubbleId;

  /**
   * @dev TaskList managed by this Session. It is constructed and initialised in the `initialise` method.
   */
  taskList;

  /**
   * @dev Constructs this Session from the locally saved state.
   */
  constructor(id, chain, bubbleProvider, wallet) {
    assert.isString(id, 'id');
    assert.isObject(chain, 'chain');
    assert.isNumber(chain.id, 'chain.id');
    assert.isString(bubbleProvider, 'bubbleProvider');
    assert.isObject(wallet, 'wallet');
    this.id = id;
    this.chain = chain;
    this.bubbleProvider = bubbleProvider;
    this.wallet = wallet;
    this._loadState();
  }

  /**
   * @dev Initialises the Task List deploying the smart contract and constructing the bubble if
   * required. The state of construction is determined by the properties read from the local saved 
   * state during construction.
   * 
   * i.e.: 
   * 
   *   this.key = null                 ->  New, so construct application key
   *   this.bubbleId = null            ->  Smart contract has not yet been deployed, so deploy it
   *   this.bubbleId.provider = null   ->  Off-chain bubble has not yet been created so create it.
   *   this.bubbleId.provider != null  ->  Fully constructed so initialise the TaskList
   *  
   */
  async initialise() {

    console.trace('Initialising session');

    if (!this.key) {
      // brand new session
      console.trace('creating session key');
      this.key = new ecdsa.Key();
      this._saveState();
    }

    if (!this.bubbleId || !this.bubbleId.contract) {
      // contract has not yet been deployed
      console.trace('deploying contract');
      const address = await this.wallet.deploy(
        this.chain, 
        contractSourceCode.default.abi, 
        contractSourceCode.default.bin, 
        [this.key.address]
      );
      this.bubbleId = {
        chain: this.chain.id,
        contract: address
      }
      this._saveState();
    }

    if (!this.bubbleId.provider) {
      // bubble has not yet been constructed
      this.bubbleId.provider = this.bubbleProvider;
      console.trace('constructing bubble', this.bubbleId);
      this.taskList = new TaskList(new ContentId(this.bubbleId), this.key.signFunction, this.key.privateKey);
      await this.taskList.create();
      this._saveState();
    }
    else {
      // bubble has already been constructed
      this.taskList = new TaskList(new ContentId(this.bubbleId), this.key.signFunction, this.key.privateKey);
    }

    await this.taskList.initialise();

  }

  /**
   * @dev Forwarded to the taskList
   */
  async createTask(text) {
    if (!this.taskList) return Promise.reject('session not initialised');
    return this.taskList.createTask(text);
  }

  /**
   * @dev Forwarded to the taskList
   */
  async toggleTask(task) {
    if (!this.taskList) return Promise.reject('session not initialised');
    return this.taskList.toggleTask(task);
  }

  /**
   * @dev Forwarded to the taskList
   */
  async deleteTask(task) {
    if (!this.taskList) return Promise.reject('session not initialised');
    return this.taskList.deleteTask(task);
  }

  /**
   * @dev Return the current tasks from taskList
   */
  getTasks() {
    if (!this.taskList) return Promise.reject('session not initialised');
    return this.taskList.tasks;
  }

  /**
   * @dev Return the current taskList's bubble id
   */
  getBubbleId() {
    if (!this.taskList) return Promise.reject('session not initialised');
    return this.taskList.bubble.contentId;
  }

  /**
   * @dev Returns `true` if the smart contract has not yet been deployed
   */
  isNew() {
    return this.bubbleId === undefined || this.bubbleId.contract === undefined;
  }

  /**
   * @dev Loads the Session state from localStorage
   */
  _loadState() {
    const stateJSON = window.localStorage.getItem(this.id);
    const stateData = stateJSON ? JSON.parse(stateJSON) : {};
    console.trace('loaded state', stateData);
    switch (stateData.version) {
      case undefined:
        // old base-goerli session. Base goerli has been shut down so delete any bubble
        console.log('upgrading state from version 1 to version 2. Old bubble id:', JSON.stringify(stateData.bubbleId));
        stateData.bubbleId = undefined;
      default:
        // nothing to do
    }
    this.key = stateData.key ? new ecdsa.Key(stateData.key) : undefined;
    this.bubbleId = stateData.bubbleId;
  }

  /**
   * @dev Saves the Session state to localStorage
   */
  _saveState() {
    const stateData = {
      version: STATE_VERSION,
      key: this.key.privateKey,
      bubbleId: this.bubbleId
    };
    window.localStorage.setItem(this.id, JSON.stringify(stateData));
  }

}