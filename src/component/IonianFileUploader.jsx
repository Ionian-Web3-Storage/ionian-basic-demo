import { useFileUploader, FileUploader } from "./FileUploader";
import create from "zustand";
import { CLIENT_ENDPOINT, CONTRACT_ABI, CONTRACT_ADDRESS } from "../consts";
import { hooks } from "../connectors/metaMask";
import { useEffect } from "react";
import { Contract } from "@ethersproject/contracts";
import { useFileListStore } from "./FileList";
import { useNodes } from "./NodeList";
import { useChainIsOk, connect } from "./WalletButton";

const { useProvider } = hooks;
const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI);

const DEBUGING = localStorage.getItem("________DEBUGING");

window.ooon = () => localStorage.setItem("________DEBUGING", "true");
window.oooff = () => localStorage.removeItem("________DEBUGING");

// state
// 0 init
// 1 file added, getting merkle root
// 2 got merkle root, request sending tx
// 3 tx sent, waiting for confirmation
// 4 tx confirmed, uploading file
// 5 file uploaded
const useIonianFileUploaderStore = create((set, get) => ({
  state: 0,
  name: null,
  root: null,
  size: null,
  date: null,
  segments: null,
  provider: null,
  fileIonianStatus: null,

  updateStatusInterval: null,

  getFileForList: () => {
    const { state, name, root, size, date, segments, fileIonianStatus } = get();
    return { state, name, root, size, date, segments, fileIonianStatus };
  },

  setProvider: (provider) => set({ provider }),

  addFile: (fileName) => {
    if (get().state !== 0)
      return console.warn(`Can't add file at state: ${get().state}`);
    if (!fileName) throw new Error(`Invalid file name: ${fileName}`);
    set({ name: fileName, state: 1 });
    fetch(`${CLIENT_ENDPOINT}/local/file?path=${fileName}`, { mode: "cors" })
      .then((res) => res.json())
      .then((x) => x.data)
      .then(get().addFileInfo);
  },

  addFileInfo: ({ name, root, size, segments }) => {
    if (get().state !== 1)
      return console.warn(`Can't add file info at state: ${get().state}`);
    set({ state: 2, root, size, segments, name });
    // if (false) {
    contract
      .connect(get().provider.getSigner())
      .appendLog(get().root, get().size)
      .then(() => get().txSent());
    // }
  },

  txSent: () => {
    if (get().state !== 2)
      return console.warn(`Can't get on chain state at state: ${get().state}`);
    set({
      date: new Date().getTime(),
      state: 3,
      updateStatusInterval: setInterval(get().updateFileStatus, 3000),
    });
    useFileListStore.getState().upsertFile(get().getFileForList());
  },

  fileStatusAvailable: () => {
    set({ fileIonianStatus: "available", state: 4 });
    useFileListStore.getState().upsertFile(get().getFileForList());
    fetch(`${CLIENT_ENDPOINT}/local/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: get().name,
        node: parseInt(useNodes.getState().curNode, 10),
      }),
    });
  },

  fileUploaded: () => {
    set({ fileIonianStatus: "uploaded", state: 5 });
    useFileListStore.getState().upsertFile(get().getFileForList());
    get().reset();
  },

  setFileStatus: (status) => {
    const curStatus = get().fileIonianStatus;
    if (status === "unavailable") return set({ fileIonianStatus: status });
    if (
      (curStatus === "unavailable" || !curStatus) &&
      status === "available" &&
      get().state === 3
    )
      return get().fileStatusAvailable();
    if (
      curStatus === "available" &&
      status === "finalized" &&
      get().state === 4
    ) {
      if (get().updateStatusInterval) {
        clearInterval(get().updateStatusInterval);
        set({ updateStatusInterval: null });
      }
      return get().fileUploaded();
    }
  },

  // update file on change status
  updateFileStatus: () => {
    if (get().state !== 3 && get().state !== 4) {
      if (get().updateStatusInterval) {
        clearInterval(get().updateStatusInterval);
        set({ updateStatusInterval: null });
      }
    }
    fetch(`${CLIENT_ENDPOINT}/local/status?root=${get().root}`)
      .then((res) => res.json())
      .then((x) => x.data)
      .then(get().setFileStatus);
  },

  reset: () => {
    if (get().updateStatusInterval) clearInterval(get().updateStatusInterval);
    useFileUploader.getState().reset();
    set({
      state: 0,
      name: null,
      root: null,
      size: null,
      segments: null,
      date: null,
      updateStatusInterval: null,
    });
  },
}));

export function useIonianFileUploader() {
  const provider = useProvider();
  const store = useIonianFileUploaderStore();

  useEffect(() => {
    if (provider) store.setProvider(provider);
  }, [provider]);

  const { fileName } = useFileUploader();

  useEffect(() => {
    if (fileName) store.addFile(fileName);
    else {
      store.reset();
      useFileUploader.getState().reset();
    }
  }, [fileName]);

  return store;
}

export function IonianFileUploader(props) {
  const store = useIonianFileUploader();
  const chainOK = useChainIsOk();
  return (
    <>
      <FileUploader
        {...props}
        onClick={(e) => {
          if (!chainOK) {
            connect();
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      />
      {DEBUGING && (
        <section>
          <p>-----------------------DEBUG INFO-----------------------</p>
          <p>
            // state <br />
            // 0 init <br />
            // 1 file added, getting merkle root <br />
            // 2 got merkle root, request sending tx <br />
            // 3 tx sent, waiting for confirmation <br />
            // 4 tx confirmed, uploading file <br />
            // 5 file uploaded <br />
          </p>
          <ul className="p-4 ml-16">
            <li>state: {store.state}</li>
            <li>name: {store.name}</li>
            <li>root: {store.root}</li>
            <li>size: {store.size}</li>
            <li>segments: {store.segments}</li>
            <li>fileIonianStatus: {store.fileIonianStatus}</li>
          </ul>
          <p>-----------------------DEBUG INFO-----------------------</p>
        </section>
      )}
    </>
  );
}
