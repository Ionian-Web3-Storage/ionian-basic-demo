import uppycore from "@uppy/core";
import create from "zustand";
import { Dashboard } from "@uppy/react";
import cx from "classnames";

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

if (import.meta.env.NODE_ENV !== "production") uppy.reset();

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

export function FileUploader({ className, ...props }) {
  return (
    <div className="w-70% m-auto">
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
        className={cx(className, "")}
      />
    </div>
  );
}
