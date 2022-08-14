import create from "zustand";
import { hooks } from "../connectors/metaMask";

const {
  useChainId,
  useAccounts,
  useIsActivating,
  useIsActive,
  useProvider,
  useENSNames,
} = hooks;

export const useNetworkList = create((set) => ({
  chainId: 80001,
}));
