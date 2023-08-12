// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { stateManager } from '../state-context';
import * as contractSourceCode from './contracts/TodoListBubble.json';
import { ecdsa } from '@bubble-protocol/crypto';
import { bubbleProviders, encryptionPolicies, Bubble, toFileId } from '@bubble-protocol/client';
import { MetamaskWallet } from './MetamaskWallet';

const APP_ID = 'todo-list-example';

const CHAIN = 84531;  // base goerli
const BUBBLE_PROVIDER = "https://vault.bubbleprotocol.com/v2/base-goerli";

const STATES = {
  closed: 'closed',
  new: 'new',
  initialising: 'initialising',
  initialised: 'initialised',
  failed: 'failed'
}

export class TodoListApp {

  state = STATES.closed;
  session;
  wallet;
  bubble;
  tasks = [];

  constructor() {
    this.wallet = new MetamaskWallet();
    stateManager.register('state', this.state);
    stateManager.register('error');
    stateManager.register('tasks', []);
    stateManager.register('taskFunctions', {
      createTask: this.newTask.bind(this),
      toggleDone: this.toggleTask.bind(this),
      deleteTask: this.deleteTask.bind(this)
    });
    stateManager.register('walletFunctions', {
      connect: this.connectWallet.bind(this),
      createTodoList: this.createTodoList.bind(this),
    });
  }

  async connectWallet() {
    return this.wallet.connect()
      .then(() => {
        this._loadState();
        if (this.session.bubbleId) this._initialiseSession();
        else this._setState(STATES.new);
      })
      .catch(error => {
        stateManager.dispatch('error', new Error('Could not connect wallet: '+error.message));
      })
  }

  async createTodoList() {
    return this._initialiseSession()
    .catch(error => {
      stateManager.dispatch('error', new Error('Could not connect wallet: '+error.message));
    })
  }

  async newTask(text) {
    const task = {
      created: Date.now(),
      text: text,
      done: false
    }
    task.fileId = ecdsa.hash(JSON.stringify(task));
    return this._saveTask(task)
      .then(() => {
        this.tasks.push(task);
        stateManager.dispatch('tasks', [...this.tasks]);
      })
      .catch(error => {
        stateManager.dispatch('error', new Error('Failed to write task: '+error.message));
      })  
  }

  async toggleTask(task) {
    task.done = !task.done;
    return this._saveTask(task)
    .then(() => {
      stateManager.dispatch('tasks', [...this.tasks]);
    })
    .catch(error => {
      stateManager.dispatch('error', new Error('Failed to write task: '+error.message));
    })  
}

  async deleteTask(task) {
    return this.bubble.delete(task.fileId)
    .then(() => {
      this.tasks = this.tasks.filter(t => t.fileId !== task.fileId);
      stateManager.dispatch('tasks', this.tasks);
    })
    .catch(error => {
      stateManager.dispatch('error', new Error('Failed to delete task: '+error.message));
    })  
  }

  async _saveTask(task) {
    console.trace('saving task', task);
    const taskData = {...task, fileId: undefined};  // don't need to save fileId
    return this.bubble.write(task.fileId, JSON.stringify(taskData));
  }

  async _initialiseSession() {
    this._setState(STATES.initialising);
    return this._initialise()
      .then(() => {
        this._setState(STATES.initialised);
      })
      .catch(error => {
        console.warn(error);
        this._setState(STATES.failed);
        stateManager.dispatch('error', error)
      });
  }

  async _initialise() {

    console.trace('Initialising session');

    if (!this.session || !this.session.key) {
      console.trace('creating device key');
      this.session = {
        key: new ecdsa.Key()
      };
      this._saveState();
    }

    if (!this.session.bubbleId || !this.session.bubbleId.contract) {
      // contract has not yet been deployed
      console.trace('deploying contract');
      const address = await this.wallet.deploy(
        CHAIN, 
        contractSourceCode.default.abi, 
        contractSourceCode.default.bin, 
        [this.session.key.address]
      );
      this.session.bubbleId = {
        chain: CHAIN,
        contract: address
      }
      this._saveState();
    }

    const provider = new bubbleProviders.HTTPBubbleProvider(BUBBLE_PROVIDER);
    const encryptionPolicy = new encryptionPolicies.AESGCMEncryptionPolicy(this.session.key.privateKey);

    if (!this.session.bubbleId.provider) {
      // bubble has not yet been constructed
      this.session.bubbleId.provider = BUBBLE_PROVIDER;
      console.trace('constructing bubble', this.session.bubbleId);
      this.bubble = new Bubble(this.session.bubbleId, provider, this.session.key.signFunction, encryptionPolicy);
      await this.bubble.create();
      this._saveState();
    }
    else {
      this.bubble = new Bubble(this.session.bubbleId, provider, this.session.key.signFunction, encryptionPolicy);
    }

    console.trace('loading tasks');
    const taskFiles = await this.bubble.list(toFileId(0));
    await Promise.all(
      taskFiles.map(async file => {
        const json = await this.bubble.read(file.name);
        const task = JSON.parse(json);
        task.fileId = file.name;
        this.tasks.push(task);
      })
    )

    console.trace('tasks', this.tasks);

    stateManager.dispatch('tasks', [...this.tasks]);

  }

  _loadState() {
    const stateJSON = window.localStorage.getItem(APP_ID);
    const stateData = stateJSON ? JSON.parse(stateJSON) : {};
    if (stateData.key) stateData.key = new ecdsa.Key(stateData.key);
    this.session = stateData;
  }

  _saveState() {
    const stateData = {...this.session};
    stateData.key = this.session.key.privateKey;
    window.localStorage.setItem(APP_ID, JSON.stringify(stateData));
  }

  _setState(state) {
    this.state = state;
    stateManager.dispatch('state', this.state);
  }

}