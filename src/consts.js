export const TARGET_CHAIN = {
  chainName: import.meta.env.VITE_TARGET_CHAIN_NAME,
  chainId: parseInt(import.meta.env.VITE_TARGET_CHAINID, 10),
  rpcUrls: [import.meta.env.VITE_TARGET_RPC_URL],
  blockExplorerUrls: [import.meta.env.VITE_TARGET_EXPLORER_URL],
  nativeCurrency: {
    symbol: import.meta.env.VITE_TARGET_TOKEN_NAME,
    name: import.meta.env.VITE_TARGET_TOKEN_NAME,
    decimals: 18,
  },
};

export const CLIENT_ENDPOINT = import.meta.env.LOCAL_CLIENT_ENDPOINT;
