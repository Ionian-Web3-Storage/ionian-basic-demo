import create from "zustand";
import { persist } from "zustand/middleware";
import cx from "classnames";
import * as Accordion from "@radix-ui/react-accordion";
import { useEffect } from "react";

import { CLIENT_ENDPOINT } from "../consts";

const useFileListStore = create(
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
  return (
    <div className={cx(className)} {...props}>
      {`0x${children.substring(2, 8)}...${children.substring(58, 66)}`}
    </div>
  );
}

function Download({ name, root, className, ...props }) {
  return (
    <button
      {...props}
      className={cx(className, "block")}
      onClick={() =>
        fetch(`${CLIENT_ENDPOINT}/local/download`, {
          method: "POST",
          mode: "cors",
          body: JSON.stringify({ node: 0, root, path: `~/Downloads/${name}` }),
        })
      }
    >
      <img className="w-6" src="./download.svg" />
    </button>
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
    <Accordion.Item {...props} className={cx(className, "relative")}>
      <div className="my-2 grid grid-flow-row-dense grid-cols-24 mb-4">
        <div className="col-span-2">
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
    </Accordion.Item>
  );
}

export function FileList({ className, ...props }) {
  const { files } = useFileList();
  return (
    <div className="w-70% translate-x-22.5% b-px b-black py-8 px-4">
      <div className="grid grid-flow-row-dense grid-cols-24 mb-4 justify-items-start content-center items-center justify-center font-bold text-lg">
        <div className="col-span-2" />
        <div className="col-span-8">Date</div>
        <div className="col-span-10">Merkle Root</div>
        <div className="col-span-3">File Size</div>
        <div className="col-span-1" />
      </div>
      <Accordion.Root {...props} className={cx(className)}>
        {files.map((file, idx) => (
          <OneFile key={idx} idx={idx} {...file} />
        ))}
      </Accordion.Root>
    </div>
  );
}
