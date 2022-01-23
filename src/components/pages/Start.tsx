import React, { useState } from "react";
import { usePeerToPeer } from "../../hooks/useP2P";

// TODONOW: add container pattern, so that the UI can be tested in Storybook
const StartPage = () => {
  const [codeInput, setCodeInput] = useState<string>("");
  const { data, methods: p2p } = usePeerToPeer();

  React.useEffect(() => {
    return () => {
      p2p.disconnect();
    };
  }, []);

  const handleConnect = () => {
    // TODONOW: add Result class
    p2p.connect(parseInt(codeInput));
  };
  const handleUpdatePeerId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCodeInput(event.target.value);
  };
  const handleSendMessage = () => {
    p2p.sendMessage("Hi there");
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>P2P chat</p>
        <p>
          Your Code is: <code>{data.code}</code>
        </p>

        <input
          type="text"
          name="Peer's ID"
          maxLength={5}
          value={codeInput}
          onChange={handleUpdatePeerId}
        />
        <button type="button" onClick={handleConnect}>
          Connect
        </button>
        <button type="button" onClick={(aaa) => handleSendMessage()}>
          Send message
        </button>
      </header>
    </div>
  );
};

export default StartPage;
