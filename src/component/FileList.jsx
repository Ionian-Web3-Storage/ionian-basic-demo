import create from "zustand";
import { persist } from "zustand/middleware";
import cx from "classnames";
import * as Accordion from "@radix-ui/react-accordion";
import { useEffect, useState } from "react";
import { TARGET_CHAIN } from "../consts";
import { useCopyToClipboard } from "react-use";
import { useNodes } from "./NodeList";
import * as Toast from "@radix-ui/react-toast";

import { CLIENT_ENDPOINT } from "../consts";

export const useFileListStore = create(
  persist(
    (set, get) => ({
      expanded: null,
      files: [],
      setExpanded: (idx) => set({ expanded: idx }),
      addFile: (file) => set({ files: get().files.concat([file]) }),
      upsertFile: (file) => {
        if (!file?.root) return;
        const fileIdx = get().getFileIdxByMerkleRoot(file.root);
        if (fileIdx === -1) return get().addFile(file);
        else get().updateFile(fileIdx, file);
      },
      updateFile: (idx, file) => {
        const files = get().files.slice();
        files[idx] = { ...files[idx], ...file };
        set({ files });
      },
      getFileIdxByMerkleRoot: (root) =>
        get().files.findIndex((file) => file.root === root),
      removeFileByIdx: (idx) => {
        if (!Number.isInteger(idx)) return;
        set({
          files: get()
            .files.slice(0, idx)
            .concat(get().files.slice(idx + 1)),
        });
      },
      removeFileByMerkleRoot: (root) =>
        get().removeFileByIdx(get().getFileIdxByMerkleRoot(root)),
      removeFile: (idxOrMerkleRoot) => {
        if (Number.isInteger(idxOrMerkleRoot))
          return get().removeFileByIdx(idxOrMerkleRoot);
        else if (typeof idxOrMerkleRoot === "string")
          return get().removeFileByMerkleRoot(idxOrMerkleRoot);
      },
    }),
    {
      name: "file-list-storage",
    }
  )
);

export function useFileList() {
  const store = useFileListStore();

  if (store.expanded === null && store.files.length) store.setExpanded(0);

  return store;
}

function rightShift(str) {
  if (str.length === 1) return `0${str}`;
  return str;
}

function DateTime({ timeStamp }) {
  const t = new Date(timeStamp);
  const Y = t.getFullYear();
  const M = rightShift((t.getMonth() + 1).toString());
  const D = rightShift(t.getDate().toString());
  const h = rightShift(t.getHours().toString());
  const m = rightShift(t.getMinutes().toString());

  return <time dateTime={t.toISOString()}>{`${Y}/${M}/${D}, ${h}:${m}`}</time>;
}

function shortenBytes(n) {
  const k = n > 0 ? Math.floor(Math.log2(n) / 10) : 0;
  const rank = (k > 0 ? "KMGT"[k - 1] : "") + "b";
  const count = Math.floor(n / Math.pow(1024, k));
  return count + " " + rank;
}

function MerkleRoot({ children, className, ...props }) {
  const [, copy] = useCopyToClipboard();
  return (
    <div {...props} className={cx(className, "flex flex-row")}>
      <span>
        {`0x${children.substring(2, 8)}...${children.substring(58, 66)}`}
      </span>
      <button className="z-20" onClick={() => copy(children)}>
        <img className="ml-1 w-3" src="./copy.svg" />
      </button>
    </div>
  );
}

function Download({ name, root, className, ...props }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        {...props}
        className={cx(className, "block")}
        onClick={() =>
          fetch(`${CLIENT_ENDPOINT}/local/download`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            body: JSON.stringify({
              node: parseInt(useNodes.getState().curNode, 10),
              root,
              /* path: `~/Downloads/${name}`, */
              path: name,
            }),
          }).then(() => {
            setOpen(true);
            setTimeout(() => setOpen(false), 3000);
          })
        }
      >
        <img className="w-6" src="./download.svg" />
      </button>
      <Toast.Root open={open} className="border border-#fafafa p-2 bg-#FAFAFA">
        <div className="border border-#dfdfdf border-dashed py-4 px-4 flex flex-row">
          <Toast.Title>Download Finished!</Toast.Title>
          <Toast.Action altText="OK" className="ml-2 font-bold text-#2e39ff">
            <button onClick={() => setOpen(false)}>OK</button>
          </Toast.Action>
        </div>
      </Toast.Root>
    </>
  );
}

function FileStatus({ state, className, ...props }) {
  return (
    <Accordion.Content {...props} className={cx(className)}>
      {state >= 3 && (
        <ul className="pl-8">
          <li className="flex flex-row pb-2">
            {state === 3 && <img src="./running.svg" />}
            {state !== 3 && <img src="./check.svg" />}
            <span className="ml-4">{`Indexing on  Layer1 (${TARGET_CHAIN.chainName})`}</span>
          </li>
          {state >= 4 && (
            <li className="flex flex-col py-1">
              <div className="flex flex-row">
                {state === 4 && <img src="./running.svg" />}
                {state !== 4 && <img src="./check.svg" />}
                <span className="ml-4">
                  Sync Layer1 data to Layer2 (IONIAN)
                </span>
              </div>
              {state === 4 && (
                <span className="ml-10 text-sm text-#979797">
                  Uploading Files
                </span>
              )}
            </li>
          )}
          {state === 5 && (
            <li className="flex flex-row py-1">
              <img src="./check.svg" />
              <span className="ml-4">Uploaded</span>
            </li>
          )}
        </ul>
      )}
    </Accordion.Content>
  );
}

export function OneFile({
  idx,
  state,
  name,
  date,
  root,
  size,
  fileIonianStatus,
  className,
  ...props
}) {
  const { setExpanded } = useFileList();
  useEffect(() => {
    if (state !== 5) setExpanded(idx);
  }, [state]);
  return (
    <Accordion.Item
      {...props}
      className={cx(className, "relative")}
      value={idx + ""}
    >
      <Accordion.Header className="mb-4 py-2">
        <div className="w-full grid grid-flow-row-dense grid-cols-24 justify-items-start">
          <div className="col-span-2 justify-self-center">
            {state === 5 && <img src="./check.svg" />}
            {state !== 5 && <img src="./loading.svg" />}
          </div>
          <div className="col-span-8">
            <DateTime timeStamp={date} />
          </div>
          <MerkleRoot className="col-span-10">{root}</MerkleRoot>
          <div className="col-span-3 uppercase">{shortenBytes(size)}</div>
          <div className="col-span-1">
            {state === 5 && <Download root={root} name={name} />}
          </div>
        </div>
        <Accordion.Trigger
          className="absolute w-90% h-full -translate-y-100%"
          onClick={() => setExpanded(idx)}
        />
      </Accordion.Header>
      <FileStatus state={state} />
    </Accordion.Item>
  );
}

export function FileList({ className, ...props }) {
  const { files } = useFileList();
  const { expanded } = useFileList();
  return (
    <div
      className={cx(
        className,
        "w-70% m-auto border border-#fafafa p-2 bg-#FAFAFA"
      )}
    >
      <div className="border border-#dfdfdf border-dashed py-8 px-4">
        <div className="grid grid-flow-row-dense grid-cols-24 mb-4 justify-items-start content-center items-center justify-center font-bold text-lg">
          <div className="col-span-2" />
          <div className="col-span-8">Date</div>
          <div className="col-span-10">Merkle Root</div>
          <div className="col-span-3">File Size</div>
          <div className="col-span-1" />
        </div>
        <Accordion.Root {...props} type="single" value={expanded + ""}>
          {files.reverse().map((file, idx) => (
            <OneFile key={idx} idx={idx} {...file} />
          ))}
        </Accordion.Root>
      </div>
    </div>
  );
}
