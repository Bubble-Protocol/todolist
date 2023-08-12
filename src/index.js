import React from 'react';
import ReactDOM from 'react-dom/client';
import UI from './ui/App.js';
import { TodoListApp } from './model/App.js';

// Config
const TRACE_ON = true;
const DEBUG_ON = true;

// Add trace and debug log options
console.stackTrace = console.trace;
console.trace = TRACE_ON ? Function.prototype.bind.call(console.info, console, "[trace]") : function() {};
console.debug = DEBUG_ON ? Function.prototype.bind.call(console.info, console, "[debug]") : function() {};

// Construct the model
const app = new TodoListApp();

// Render the ui
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UI app={app} />
  </React.StrictMode>
);
