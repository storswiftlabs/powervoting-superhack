import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "@rainbow-me/rainbowkit/styles.css";
import {
  darkTheme,
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { filecoin, filecoinCalibration } from 'wagmi/chains';
import { publicProvider } from "wagmi/providers/public";
import { walletConnectProjectId } from './utils/definitions/consts';

console.log(filecoin.rpcUrls.default.http[0]);
console.log(filecoinCalibration.rpcUrls.default.http[0]);

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [filecoin, filecoinCalibration],
  [
    publicProvider(),
  ]
)

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ projectId: walletConnectProjectId, chains }),
      // rainbowWallet({ projectId: walletConnectProjectId, chains }),
      // trustWallet({ projectId: walletConnectProjectId, chains }),
      // coinbaseWallet({ appName: 'power-voting', chains }),
    ],
  },
]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient
})

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <WagmiConfig config={config}>
    <RainbowKitProvider
      theme={darkTheme({
        accentColor: "#7b3fe4",
        accentColorForeground: "white",
      })}
      chains={chains}
      modalSize="compact"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RainbowKitProvider>
  </WagmiConfig>
)

