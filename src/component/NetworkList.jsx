import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { TARGET_CHAIN } from "../consts";
import create from "zustand";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { forwardRef, useRef } from "react";
import cx from "classnames";
import { useHoverDirty } from "react-use";

const chainList = [
  TARGET_CHAIN,
  {
    chainName: "Ethereum Ropsten",
    chainId: 3,
    rpcUrls: "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    blockExplorerUrls: ["https://ropsten.etherscan.io"],
    nativeCurrency: {
      symbol: "ETH",
      name: "Ether",
      decimals: 18,
    },
  },
  {
    chainName: "Arbitrum Testnet",
    chainId: 421611,
    rpcUrls: "https://rinkeby.arbitrum.io/rpc",
    blockExplorerUrls: ["https://testnet.arbiscan.io/"],
    nativeCurrency: {
      symbol: "ETH",
      name: "Ether",
      decimals: 18,
    },
  },
  {
    chainName: "Optimistic Kovan",
    chainId: 69,
    rpcUrls: "https://kovan.optimism.io",
    blockExplorerUrls: ["https://kovan-optimistic.etherscan.io/"],
    nativeCurrency: {
      symbol: "ETH",
      name: "Ether",
      decimals: 18,
    },
  },
];

const useNetworkList = create((set) => ({
  cur: 0,
  setCurrent: (cur) => set({ cur }),
}));

const Trigger = forwardRef(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <NavigationMenu.Trigger
        ref={forwardedRef}
        className={cx(className, "flex flex-row items-center")}
        {...props}
      >
        {children}
        <CaretDownIcon aria-hidden />
      </NavigationMenu.Trigger>
    );
  }
);

function OneNetwork({ idx, className, ...props }) {
  const { chainName } = chainList[idx];
  const { setCurrent } = useNetworkList();
  const ref = useRef(null);
  const hovering = useHoverDirty(ref);

  return (
    <NavigationMenu.Item
      {...props}
      ref={ref}
      key={idx}
      value={chainName}
      className={cx(className, "text-right text-lg py-4 pr-10%", {
        "bg-black": hovering,
        "text-white": hovering,
      })}
    >
      <button onClick={() => setCurrent(idx)}>{chainName}</button>
    </NavigationMenu.Item>
  );
}

export function NetworkList({ className, ...props }) {
  const { cur } = useNetworkList();
  return (
    <NavigationMenu.Item {...props} className={cx(className)}>
      <Trigger>{chainList[cur].chainName}</Trigger>
      <NavigationMenu.Content className="w-screen absolute -mt-4 z-2001 bg-white">
        <NavigationMenu.Sub value={chainList[cur].chainName}>
          <NavigationMenu.List>
            {chainList.map((_, idx) => (
              <OneNetwork key={idx} idx={idx} />
            ))}
          </NavigationMenu.List>
          <NavigationMenu.Viewport />
        </NavigationMenu.Sub>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  );
}
