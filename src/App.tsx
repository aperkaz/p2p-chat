import React from "react";
import { usePeerToPeer } from "./hooks/useP2P";
import StartPage from "./components/pages/Start";
import ChatPage from "./components/pages/Chat";
import "./App.css";

const App = () => {
  const { data, methods: p2p } = usePeerToPeer();

  if (data.status === "disconnected") return <StartPage />;
  if (data.status === "connected") return <ChatPage />;

  throw new Error(`Unhandled connection case! [${data.status}]`);
};

export default App;
