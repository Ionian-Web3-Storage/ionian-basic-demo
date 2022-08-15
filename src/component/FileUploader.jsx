import uppycore from "@uppy/core";
import create from "zustand";
import { Dashboard } from "@uppy/react";

const uppy = new uppycore({
  id: "default",
  allowMultipleUploads: false,
  allowMultipleUploadBatches: false,
  autoProceed: false,
  restrictions: {
    maxNumberOfFiles: 1,
    minNumberOfFiles: 1,
  },
});

export const useFileUploader = create((set) => ({
  base64: null,
  fileName: null,
  fileAdded: () => {
    const reader = new FileReader();
    const file = uppy.getFiles()[0];
    reader.readAsDataURL(file.data);
    reader.onloadend = () => {
      set({ base64: reader.result, fileName: file.name });
    };
  },
  fileRemoved: () => set({ base64: null, fileName: null }),
  reset: () => {
    set({ base64: null, fileName: null });
    uppy.reset();
  },
}));

uppy.on("file-added", useFileUploader.getState().fileAdded);
uppy.on("file-removed", useFileUploader.getState().fileRemoved);

export function FileUploader(props) {
  return (
    <>
      <link
        rel="stylesheet"
        type="text/css"
        href="https://releases.transloadit.com/uppy/v2.12.1/uppy.min.css"
      />
      <style type="text/css">
        {`.uppy-Dashboard-Item-action--remove { display: none; }`}
      </style>
      <Dashboard
        allowMultipleUploads={false}
        hideCancelButton
        hidePauseResumeButton
        hideRetryButton
        hideProgressAfterFinish
        disableThumbnailGenerator
        disableStatusBar
        disableInformer
        fileManagerSelectionType="files"
        uppy={uppy}
        width="100%"
        height="16rem"
        proudlyDisplayPoweredByUppy={false}
        theme="light"
        {...props}
      />
    </>
  );
}
