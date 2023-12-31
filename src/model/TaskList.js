// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import { bubbleProviders, encryptionPolicies, Bubble, toFileId } from '@bubble-protocol/client';
import { ContentId, assert } from '@bubble-protocol/core';
import { ecdsa } from '@bubble-protocol/crypto';


/**
 * Encapsulates a task list and its off-chain bubble.  The bubble's contract is defined by the 
 * smart contract in `./contracts/TodoListBubble.sol`, which is deployed by the Session class's 
 * initialise function.
 * 
 * Each task is written to the bubble in its own separate file in the root directory (dir 0).
 * A task's file name is the hash of the task data. All files are encrypted by the encryption 
 * policy defined in the constructor.  Tasks are sorted based on their file creation date.
 * 
 */
export class TaskList {

  /**
   * @dev The off-chain bubble, instance of the Bubble class.
   */
  bubble;

  /**
   * @dev Local copy of the task list, read from the bubble during initialisation.
   */
  tasks = [];

  /**
   * @dev Constructs the `bubble` object, an instance of the `Bubble` class. Specifies HTTP(S) as
   * the interface to the off-chain bubble host, and specifies an AESGCM encryption policy to
   * encrypt all contents with the given encryption key.
   */
  constructor(bubbleId, signFunction, encryptionKey) {
    assert.isInstanceOf(bubbleId, ContentId, 'bubbleId');
    const provider = new bubbleProviders.HTTPBubbleProvider(bubbleId.provider);
    const encryptionPolicy = new encryptionPolicies.AESGCMEncryptionPolicy(encryptionKey);
    this.bubble = new Bubble(bubbleId, provider, signFunction, encryptionPolicy);
  }

  /**
   * @dev Constructs the off-chain bubble. Does not reject if the bubble already exists.
   */
  async create(options={}) {
    return this.bubble.create({silent: true, ...options});
  }

  /**
   * @dev Loads the task list from the bubble and initialises the `tasks` array.
   */
  async initialise() {
    console.trace('initialising task list');
    console.trace('bubble id:', this.bubble.contentId.toObject());
    console.trace('bubble id as DID:', this.bubble.contentId.toDID());
    const taskFiles = await this.bubble.list(toFileId(0));
    await Promise.all(
      taskFiles.map(async file => {
        const json = await this.bubble.read(file.name);
        const task = JSON.parse(json);
        task.fileId = file.name;
        this.tasks.push(task);
      })
    )
    this.tasks.sort((a,b) => a.created - b.created);
    console.trace('loaded tasks', this.tasks);
  }

  /**
   * @dev Promises to add a new task and write it to the bubble.
   */
  async createTask(text) {
    const task = {
      created: Date.now(),
      text: text,
      done: false
    }
    task.fileId = ecdsa.hash(JSON.stringify(task));
    await this._saveTask(task);
    this.tasks.push(task);
  }

  /**
   * @dev Promises to toggle the task's 'done' status update the task in the bubble.
   */
  async toggleTask(task) {
    task.done = !task.done;
    return this._saveTask(task);
  }

  /**
   * @dev Promises to delete the given task from tasks array and the bubble.
   */
  async deleteTask(task) {
    console.trace('deleting task', task);
    await this.bubble.delete(task.fileId);
    this.tasks = this.tasks.filter(t => t.fileId !== task.fileId);
  }

  /**
   * @dev Promises to save the given task to the bubble.
   */
  async _saveTask(task) {
    console.trace('saving task', task);
    const taskData = {...task, fileId: undefined};  // don't need to save fileId
    return this.bubble.write(task.fileId, JSON.stringify(taskData));
  }

}