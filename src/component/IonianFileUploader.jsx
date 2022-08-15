import { useFileUploader, FileUploader } from "./FileUploader";
import create from "zustand";
import { CLIENT_ENDPOINT } from "../consts";
import { hooks } from "../connectors/metaMask";
import { useEffect } from "react";

const { useProvider } = hooks;

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
  addFile: (fileName) => {
    if (get().state !== 0)
      throw new Error(`Can't add file at state: ${get().state}`);
    if (!fileName) throw new Error(`Invalid file name: ${fileName}`);
    set({ name: fileName, state: 1 });
    fetch(`${CLIENT_ENDPOINT}/local/file?path=${fileName}`).then((res) =>
      res.json()
    );
  },
  addFileInfo: ({ name, root, size, segments }) => {
    if (get().state !== 1)
      throw new Error(`Can't add file at state: ${get().state}`);
    set({ state: 2, root, size, segments, name });
    if (false) {
      ethereum
        .request({ method: "eth_sendTransaction", params: {} })
        .then(() => get().txSent());
    }
  },
  txSent: () => {
    if (get().state !== 2)
      throw new Error(`Can't add file at state: ${get().state}`);
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
  const store = useIonianFileUploaderStore();

  useEffect(() => {
    if (provider) store.setProvider(provider);
  }, [provider]);

  const { fileName, reset } = useFileUploader();

  useEffect(() => {
    if (fileName) store.addFile(fileName);
    else {
      store.reset();
      reset();
    }
  }, [fileName]);

  return store;
}

export function IonianFileUploader(props) {
  return <FileUploader {...props} />;
}
