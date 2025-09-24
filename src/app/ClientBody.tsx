"use client";

import { useEffect, useState } from "react";
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@onelabs/dapp-kit';
import { getFullnodeUrl, type SuiClientOptions } from '@onelabs/sui/client';
import InitAuth from '@/components/InitAuth'
import {store} from '@/store'
import '@onelabs/dapp-kit/dist/index.css';

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  // localnet: { url: getFullnodeUrl('localnet') },
  mainnet: { url: getFullnodeUrl('mainnet'),variables: {
      myMovePackageId: '0x456',
    } },
  testnet: { url: getFullnodeUrl('testnet'),variables: {
      myMovePackageId: '0x123',
    } }
});

const queryClient = new QueryClient();

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const [autoConnectReady, setAutoConnectReady] = useState(false);
  const [shouldAutoConnect, setShouldAutoConnect] = useState(false);
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
    console.log('store.getState().isWalletLogin', !!store.getState().isWalletLogin)
    try {
      const isWalletLogin = typeof window !== 'undefined' && localStorage.getItem('isWalletLogin') === '1';
      setShouldAutoConnect(!!isWalletLogin);
    } finally {
      setAutoConnectReady(true);
    }
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork={"mainnet"} onNetworkChange={(network) => {
          console.log('Network changed:', network);
        }}>
          {autoConnectReady ? (
            <WalletProvider autoConnect={shouldAutoConnect}>
              <div className="antialiased">{children}</div>
              {/* 客户端挂载后恢复登录态/本地数据 */}
              <InitAuth />
            </WalletProvider>
          ) : null}
        </SuiClientProvider>
      </QueryClientProvider>
    </Provider>
  );
}
