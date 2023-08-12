import React, { useState } from "react";
import './App.css';
import { stateManager } from '../state-context';
import { Task } from './components/Task';
import { TextBox } from './components/TextBox';
import { Button } from './components/Button';

function UI() {

  const [text, setText] = useState('');

  const appState = stateManager.useStateData('state')();
  const appError = stateManager.useStateData('error')();
  const tasks = stateManager.useStateData('tasks')();
  const taskFunctions = stateManager.useStateData('taskFunctions')();
  const walletFunctions = stateManager.useStateData('walletFunctions')();

  function newTask() {
    taskFunctions.createTask(text)
      .then(() => setText(''));
  }

  return (
    <div className="App">
      <span className="title">Bubble Protocol TodoList</span>
      <div className='taskList'>
        {appState === 'closed' && <span className="text-button" onClick={walletFunctions.connect} >Connect Wallet</span>}
        {appState === 'new' && <div className="text-button" onClick={walletFunctions.createTodoList} >Create TODO List</div>}
        {appState === 'initialising' && <div className="loader"></div>}
        {tasks.map(task => <Task key={task.fileId} text={task.text} done={task.done} toggleDone={() => taskFunctions.toggleDone(task)} deleteTask={() => taskFunctions.deleteTask(task)} />)}
      </div>
      <div className='newTask'>
        <TextBox text={text} onChange={setText} onEnter={newTask} disabled={appState !== 'initialised'} />
        <Button title='New Task' onClick={newTask} disabled={appState !== 'initialised' || text === ''} />
      </div>
      {appError && <span className='error-text'>{appError.message}</span>}
    </div>
  );

}

export default UI;
