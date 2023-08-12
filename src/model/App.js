// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { stateManager } from '../state-context';
import { Wallet } from './Wallet';
import { Session } from './Session';

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


/**
 * The TodoListApp class is the entry point for the model. It provides all UI-facing functions
 * and keeps the UI informed of the application state, task list and any errors via the 
 * `stateManager`.
 */
export class TodoListApp {

  state = STATES.closed;
  session;
  wallet;

  constructor() {
    // Construct the wallet
    this.wallet = new Wallet();

    // Register UIstate data
    stateManager.register('state', this.state);
    stateManager.register('error');
    stateManager.register('tasks', []);

    // Register UI functions
    stateManager.register('taskFunctions', {
      createTask: this.createTask.bind(this),
      toggleDone: this.toggleTask.bind(this),
      deleteTask: this.deleteTask.bind(this)
    });
    stateManager.register('walletFunctions', {
      connect: this.connectWallet.bind(this),
      createTodoList: this.createTodoList.bind(this),
    });
  }

  /**
   * @dev Connects the wallet and constructs a new Session if successful.
   * Keeps the UI up-to-date on the state of the app as the Session is initialised.
   */
  connectWallet() {
    this.wallet.connect()
      .then(() => {
        // Construct a new session. 
        this.session = new Session(APP_ID, CHAIN, BUBBLE_PROVIDER, this.wallet);
        if (!this.session.isNew()) this._initialiseSession();
        else this._setState(STATES.new);
      })
      .catch(error => {
        stateManager.dispatch('error', new Error('Could not connect wallet: '+error.message));
      })
  }

  /**
   * @dev To be called when the app state is `new`.  Deploys the contract and constructs the
   * bubble.  Keeps the UI up-to-date on the state of the app as the Session is initialised.
   */
  async createTodoList() {
    return this._initialiseSession()
    .catch(error => {
      stateManager.dispatch('error', new Error('Could not connect wallet: '+error.message));
    })
  }

  /**
   * @dev Writes a new task to the bubble. Dispatches the updated task list when complete.
   */
  async createTask(text) {
    return this.session.createTask(text)
      .then(() => {
        stateManager.dispatch('tasks', [...this.session.getTasks()]);
      })
      .catch(error => {
        stateManager.dispatch('error', new Error('Failed to write task: '+error.message));
      })  
  }

  /**
   * @dev Toggles a task's 'done' status, writing the task to the bubble. Dispatches the 
   * updated task list when complete.
   */
  async toggleTask(task) {
    return this.session.toggleTask(task)
      .then(() => {
        stateManager.dispatch('tasks', [...this.session.getTasks()]);
      })
      .catch(error => {
        stateManager.dispatch('error', new Error('Failed to write task: '+error.message));
      })  
  }

  /**
   * @dev Deletes a task from the bubble. Dispatches the updated task list when complete.
   */
  async deleteTask(task) {
    return this.session.deleteTask(task)
      .then(() => {
        stateManager.dispatch('tasks', [...this.session.getTasks()]);
      })
      .catch(error => {
        stateManager.dispatch('error', new Error('Failed to write task: '+error.message));
      })  
  }

  /**
   * @dev Initialises the Session, which will deploy the contract and construct the bubble if
   * they haven't already been created. Keeps the UI up-to-date on the state of the app as the 
   * Session is initialised.
   */
  async _initialiseSession() {
    this._setState(STATES.initialising);
    return this.session.initialise()
      .then(() => {
        this._setState(STATES.initialised);
        stateManager.dispatch('tasks', this.session.getTasks())
      })
      .catch(error => {
        console.warn(error);
        this._setState(STATES.failed);
        stateManager.dispatch('error', error)
      });
  }

  /**
   * @dev Sets the app state and informs the UI
   */
  _setState(state) {
    this.state = state;
    stateManager.dispatch('state', this.state);
  }

}