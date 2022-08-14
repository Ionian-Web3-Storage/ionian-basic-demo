import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@unocss/reset/tailwind.css";
import "./index.css";
import "virtual:uno.css";
// import "virtual:unocss-devtools";
// unocss inspector http://127.0.0.1:5173/__unocss#/

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
