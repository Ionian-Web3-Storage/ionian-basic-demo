import { useFileUploader, FileUploader } from "./FileUploader";
import create from "zustand";
import { CLIENT_ENDPOINT, CONTRACT_ABI, CONTRACT_ADDRESS } from "../consts";
import { hooks } from "../connectors/metaMask";
import { useEffect } from "react";
import { Contract } from "@ethersproject/contracts";

const { useProvider } = hooks;
const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI);
let STORE;

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
  segments: null,
  provider: null,
  fileIonianStatus: null,
  updateStatusInterval: null,
  setProvider: (provider) => set({ provider }),
  addFile: (fileName) => {
    if (get().state !== 0)
      return console.warn(`Can't add file at state: ${get().state}`);
    if (!fileName) throw new Error(`Invalid file name: ${fileName}`);
    set({ name: fileName, state: 1 });
    fetch(`${CLIENT_ENDPOINT}/local/file?path=${fileName}`).then((res) =>
      res.json()
    );
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
    set({ state: 3 });
    set({ updateStatusInterval: setInterval(get().updateFileStatus, 3000) });
  },
  fileStatusAvaliable: () => {
    set({ fileIonianStatus: "available", state: 4 });
    fetch({
      url: `${CLIENT_ENDPOINT}/local/upload`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: get().name, node: 0 }),
    });
  },
  fileUploaded: () => {
    set({ fileIonianStatus: "uploaded", state: 5 });
  },
  setFileStatus: (status) => {
    const curStatus = get().fileIonianStatus;
    if (status === "unavailable") return set({ fileIonianStatus: status });
    if (
      curStatus === "unavailable" &&
      status === "available" &&
      get().state === 3
    )
      return get().fileStatusAvaliable();
    if (
      curStatus === "available" &&
      status === "finalized" &&
      get().state === 4
    )
      return get().fileUploaded();
  },
  updateFileStatus: () => {
    if (get().state !== 3 && get().state !== 4) {
      if (get().updateStatusInterval) {
        clearInterval(get().updateStatusInterval);
        set({ updateStatusInterval: null });
      }
    }
    fetch(`${CLIENT_ENDPOINT}/local/status?root=${get().root}`)
      .then((res) => res.text())
      .then(setFileStatus);
  },
  reset: () => {
    if (get().updateStatusInterval) clearInterval(get().updateStatusInterval);
    set({
      state: 0,
      name: null,
      root: null,
      size: null,
      segments: null,
      updateStatusInterval: null,
    });
  },
}));

export function useIonianFileUploader() {
  const provider = useProvider();
  STORE = STORE || useIonianFileUploaderStore();

  useEffect(() => {
    if (provider) STORE.setProvider(provider);
  }, [provider]);

  const { fileName, reset } = useFileUploader();

  useEffect(() => {
    if (fileName) STORE.addFile(fileName);
    else {
      STORE.reset();
      reset();
    }
  }, [fileName]);

  return STORE;
}

export function IonianFileUploader(props) {
  const store = useIonianFileUploader();

  return (
    <>
      <FileUploader {...props} />

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
    </>
  );
}
