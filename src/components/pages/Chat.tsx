import React, { useState } from "react";
import { usePeerToPeer } from "../../hooks/useP2P";

// TODONOW: add container pattern, so that the UI can be tested in Storybook
const ChatPage = () => {
  const { data, methods: p2p } = usePeerToPeer();

  React.useEffect(() => {
    return () => {
      p2p.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    p2p.sendMessage("Hi there");
  };

  return (
    <div className="App">
      <header className="App-header">
        <button type="button" onClick={(aaa) => handleSendMessage()}>
          Send message
        </button>
      </header>
    </div>
  );
};

export default ChatPage;
