import React from "react";
import ReactDOM from "react-dom";
import { PeerToPeerProvider } from "./hooks/useP2P";
import "./index.css";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <PeerToPeerProvider>
      <App />
    </PeerToPeerProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
