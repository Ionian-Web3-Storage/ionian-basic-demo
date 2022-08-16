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

export const CLIENT_ENDPOINT = import.meta.env.VITE_LOCAL_CLIENT_ENDPOINT;

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "dataRoot",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "sizeBytes",
        type: "uint256",
      },
    ],
    name: "appendLog",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  ,
];
