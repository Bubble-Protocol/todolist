// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import React, { useState } from "react";
import './App.css';
import { stateManager } from '../state-context';
import { Task } from './components/Task';
import { TextBox } from './components/TextBox';
import { Button } from './components/Button';
import { CopyTextButton } from "./components/CopyTextButton";
import { ConnectButton } from '@rainbow-me/rainbowkit';


/**
 * @dev The main application screen
 */

function App() {

  // Local state data
  const [text, setText] = useState('');
  const [showDetails, toggleDetails] = useState(false);

  // Model state data
  const appState = stateManager.useStateData('state')();
  const appError = stateManager.useStateData('error')();
  const tasks = stateManager.useStateData('tasks')();
  const bubbleId = stateManager.useStateData('bubble-id')();

  // Model api functions
  const taskFunctions = stateManager.useStateData('taskFunctions')();
  const walletFunctions = stateManager.useStateData('walletFunctions')();

  // create a new task then clear the text box
  function newTask() {
    taskFunctions.createTask(text)
      .then(() => setText(''));
  }

  function formatError(error) {
    return error.details || error.message || error;
  }

  return (
    <div className="App">

      <div className="wallet-buttons">
        <ConnectButton showBalance={false} />
      </div>
      
      <span className="title">Bubble Protocol Todo List Example</span>

      {/* App state dependent UI */}
      {appState === 'closed' &&
        <div>
          <p className="info-text">
            Basic example of using Bubble Protocol to provide private, encrypted off-chain storage for a decentralised application. 
            In this todo list example, each wallet account has its own list held in an encrypted off-chain bubble that only the user can access. 
          </p>
          <p className="info-text">
            Connect your wallet to create a todo list (requires a testnet smart contract deploy).
          </p>
          <p className="info-text">
            This example runs on the <a href="https://chainlist.org/?search=polygon" target="_blank">Polygon Network</a>.
          </p>
        </div>
      }
      {appState === 'new' && <div className="text-button" onClick={walletFunctions.createTodoList} >Create TODO List</div>}
      {appState === 'initialising' && <div className="loader"></div>}

      {/* The task list */}
      {tasks.length > 0 &&
        <div className='taskList'>
          {tasks.map(task => <Task key={task.fileId} text={task.text} done={task.done} toggleDone={() => taskFunctions.toggleDone(task)} deleteTask={() => taskFunctions.deleteTask(task)} />)}
        </div>
      }

      {/* New Task TextBox and Button */}
      <div className='newTask'>
        <TextBox text={text} onChange={setText} onEnter={newTask} disabled={appState !== 'initialised'} />
        <Button title='New Task' onClick={newTask} disabled={appState !== 'initialised' || text === ''} />
      </div>

      {/* Bubble details */}
      {bubbleId && !showDetails &&
        <span className="text-button small-text-button" onClick={() => toggleDetails(true)}>show bubble details</span>
      } 
      {bubbleId && showDetails &&
        <div className="bubble-details-section">
          <span className="text-button small-text-button" onClick={() => toggleDetails(false)}>hide details</span>
          <div className="bubble-details">
            <div className="details-row">
              <span className="details-label">Chain</span>
              <span className="details-text">{bubbleId.chain}</span>
            </div>
            <div className="details-row">
              <span className="details-label">Contract</span>
              <span className="details-text"><a href={"https://polygonscan.com/address/"+bubbleId.contract} target="_blank">{bubbleId.contract}</a></span>
            </div>
            <div className="details-row">
              <span className="details-label">Provider</span>
              <span className="details-text">{bubbleId.provider}</span>
            </div>
          </div>
          <CopyTextButton className="text-button small-text-button" title="copy as DID" copyText={bubbleId.toDID()} />
        </div>
      }

      {/* View code */}
      <a className="text-button small-text-button" href="https://github.com/Bubble-Protocol/todolist" target="_blank">view source code</a>
 
      {/* Error log */}
      {appError && <span className='error-text'>{formatError(appError)}</span>}

    </div>
  );

}

export default App;
