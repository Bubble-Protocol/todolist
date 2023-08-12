import { bubbleProviders, encryptionPolicies, Bubble, toFileId } from '@bubble-protocol/client';
import { ContentId, assert } from '@bubble-protocol/core';
import { ecdsa } from '@bubble-protocol/crypto';


/**
 * Encapsulates a task list and its bubble.  
 */
export class TaskList {

  bubble;
  tasks = [];

  constructor(bubbleId, signFunction, encryptionKey) {
    assert.isInstanceOf(bubbleId, ContentId, 'bubbleId');
    assert.isFunction(signFunction, 'signFunction');
    ecdsa.assert.isPrivateKey(encryptionKey, 'encryptionKey');
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
   * @dev Reads the task list from the bubble and initialises the tasks array.
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
    return this._saveTask(task)
      .then(() => {
        this.tasks.push(task);
      });
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
    return this.bubble.delete(task.fileId)
    .then(() => {
      this.tasks = this.tasks.filter(t => t.fileId !== task.fileId);
    })
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