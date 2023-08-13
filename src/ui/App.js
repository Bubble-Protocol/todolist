import React, { useState } from "react";
import './App.css';
import { stateManager } from '../state-context';
import { Task } from './components/Task';
import { TextBox } from './components/TextBox';
import { Button } from './components/Button';
import { CopyTextButton } from "./components/CopyTextButton";

function UI() {

  const [text, setText] = useState('');
  const [showDetails, toggleDetails] = useState(false);

  const appState = stateManager.useStateData('state')();
  const appError = stateManager.useStateData('error')();
  const tasks = stateManager.useStateData('tasks')();
  const bubbleId = stateManager.useStateData('bubble-id')();
  const taskFunctions = stateManager.useStateData('taskFunctions')();
  const walletFunctions = stateManager.useStateData('walletFunctions')();

  function newTask() {
    taskFunctions.createTask(text)
      .then(() => setText(''));
  }

  return (
    <div className="App">
      <span className="title">Bubble Protocol Todo List Example</span>
      <div className='taskList'>
        {appState === 'closed' &&
          <div>
            <p className="info-text">
              Basic example of using Bubble Protocol to provide encrypted off-chain storage for a decentralised application. 
              In this todo list example, each wallet account has its own list held in an encrypted off-chain bubble. 
            </p>
            <p className="info-text">
              Connect your wallet to create a todo list (requires a smart contract deployment).
            </p>
            <p className="info-text">
              This example runs on the <a href="https://chainlist.org/?search=base+goerl&testnets=true">Base Goerli testnet</a>.  Requires Metamask.
            </p>
          </div>
        }
        {appState === 'closed' && <span className="text-button" onClick={walletFunctions.connect} >Connect Wallet</span>}
        {appState === 'new' && <div className="text-button" onClick={walletFunctions.createTodoList} >Create TODO List</div>}
        {appState === 'initialising' && <div className="loader"></div>}
        {tasks.map(task => <Task key={task.fileId} text={task.text} done={task.done} toggleDone={() => taskFunctions.toggleDone(task)} deleteTask={() => taskFunctions.deleteTask(task)} />)}
      </div>
      <div className='newTask'>
        <TextBox text={text} onChange={setText} onEnter={newTask} disabled={appState !== 'initialised'} />
        <Button title='New Task' onClick={newTask} disabled={appState !== 'initialised' || text === ''} />
      </div>
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
              <span className="details-text"><a href={"https://goerli.basescan.org/address/"+bubbleId.contract}>{bubbleId.contract}</a></span>
            </div>
            <div className="details-row">
              <span className="details-label">Provider</span>
              <span className="details-text">{bubbleId.provider}</span>
            </div>
          </div>
          <CopyTextButton className="text-button small-text-button" title="copy as DID" copyText={bubbleId.toDID()} />
        </div>
      }
      {bubbleId && !showDetails &&
        <span className="text-button small-text-button" onClick={() => toggleDetails(true)}>show bubble details</span>
      } 
      {appError && <span className='error-text'>{appError.message}</span>}
    </div>
  );

}

export default UI;
