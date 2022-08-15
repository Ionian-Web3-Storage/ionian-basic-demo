import { metaMask, hooks } from "../connectors/metaMask";
import { useEffectOnce, useInterval } from "react-use";
import { useCallback, useMemo } from "react";
import cx from "classnames";
import { shortenAddr } from "../utils";
import { TARGET_CHAIN } from "../consts";

const { useChainId, useAccounts, useIsActivating, useIsActive, useENSNames } =
  hooks;

function connect() {
  return metaMask.activate(TARGET_CHAIN);
}

export function WalletButton({ className, ...props }) {
  const isActive = useIsActive();
  const isActivating = useIsActivating();
  const chainId = useChainId();
  const wrongChain = chainId !== parseInt(TARGET_CHAIN.chainId, 10);

  const accounts = useAccounts();
  const ensName = useENSNames();

  useEffectOnce(() => {
    metaMask
      .connectEagerly()
      .catch(() => console.debug("Failed to connect eagerly to metamask"));
  });

  const text = useMemo(() => {
    if (wrongChain) return `Switch to ${TARGET_CHAIN.chainName}`;
    if (isActivating) return "Connecting";
    if (!isActive) return "Connect Wallet";
    return shortenAddr(ensName?.[0] || accounts?.[0]);
  }, [isActivating, isActive, wrongChain, ensName?.[0], accounts?.[0]]);

  const onClick = useCallback(() => {
    if (isActivating) return;
    if (!isActive || wrongChain)
      // NOTE: bug fix, web3-react failed to detect connection after network switch
      return connect()
        .then(() => window.ethereum.request({ method: "eth_accounts" }))
        .then((x) => {
          if (Array.isArray(x) && x.length > 0) setTimeout(connect, 600);
        });
  }, [isActivating, wrongChain, isActive]);

  return (
    <button
      className={cx(className, { "cursor-default": isActive && !wrongChain })}
      onClick={onClick}
      {...props}
    >
      {text}
    </button>
  );
}
