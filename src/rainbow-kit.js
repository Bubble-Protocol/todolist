import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { baseGoerli } from 'wagmi/chains';


const WALLET_CONNECT_PROJECT_ID = 'be5ecff22a547fe5ff88a79a14eb5bae'; // 'YOUR_PROJECT_ID';


const { chains, publicClient } = configureChains(
  [baseGoerli],
  [
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Bubble Protocol TODO List Example',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export const rainbowKitConfig = {
  wagmiConfig,
  chains
};