// Copyright (c) 2023 Bubble Protocol
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import UI from './ui/App.js';
import { TodoListApp } from './model/App.js';
import { rainbowKitConfig } from './rainbow-kit.js';

/**
 * @dev Add trace and debug commands to the console. Use `console.stackTrace` to dump the stack.
 */
const TRACE_ON = true;
const DEBUG_ON = true;

console.stackTrace = console.trace;
console.trace = TRACE_ON ? Function.prototype.bind.call(console.info, console, "[trace]") : function() {};
console.debug = DEBUG_ON ? Function.prototype.bind.call(console.info, console, "[debug]") : function() {};

/**
 * @dev Construct the model
 */
const app = new TodoListApp();

/**
 * @dev Render the UI
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WagmiConfig config={rainbowKitConfig.wagmiConfig}>
      <RainbowKitProvider chains={rainbowKitConfig.chains} theme={lightTheme({borderRadius: 'small'})} >
        <UI app={app} />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
