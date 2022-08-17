import * as Select from "@radix-ui/react-select";
import create from "zustand";
import { CLIENT_ENDPOINT } from "../consts";
import cx from "classnames";
import { useEffectOnce } from "react-use";
import { useMemo } from "react";

export const useNodes = create((set) => ({
  nodes: [],
  curNode: "0",
  getCurrentNode: () => get().nodes[parseInt(get().curNode, 10)],
  setCurrentNode: (curNode) => set({ curNode }),
  setNodes: (nodes) => set({ nodes }),
}));

function OneNode({ idx, className, selected, ...props }) {
  return (
    <div
      {...props}
      className={cx(className, "flex-row", {
        flex: !selected,
        hidden: selected,
      })}
    >
      <img className="mr-2" src="./connected.svg" />
      <span>{`IONIAN Node ${idx}`}</span>
    </div>
  );
}

export function NodeList({ className, ...props }) {
  const { curNode, nodes, setNodes, setCurrentNode } = useNodes();

  useEffectOnce(() => {
    fetch(`${CLIENT_ENDPOINT}/local/nodes`)
      .then((res) => res.json())
      .then((x) => x.data)
      .then((nodes) => setNodes(nodes));
  });

  const items = useMemo(
    () =>
      nodes.map((node, idx) => (
        <Select.Item key={idx} value={idx + ""} className="cursor-pointer">
          <OneNode idx={idx} selected={idx + "" === curNode + ""} />
        </Select.Item>
      )),
    [curNode, nodes.join(",")]
  );

  return (
    <Select.Root
      {...props}
      value={curNode + ""}
      onValueChange={(x) => setCurrentNode(x)}
    >
      <Select.Trigger
        className={cx(className, "block ml-8 mt-8 text-lg flex-row flex")}
      >
        <Select.Value>
          <OneNode idx={curNode} />
        </Select.Value>
        <Select.Icon className="ml-2" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="text-lg ml-8">
          <Select.Viewport>{items}</Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
