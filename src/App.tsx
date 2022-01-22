import React, { useState } from "react";
import Peer, { DataConnection } from "peerjs";

import "./App.css";

/**
 * The code is a number between 10000 and 99999
 */
const getCode = () => Math.floor(Math.random() * 89999) + 10000;
const isValidCode = (id: number | string) => {
  if (typeof id === "string") {
    if (isNaN(parseInt(id))) return false;
    return parseInt(id) >= 10000 && parseInt(id) <= 99999;
  } else {
    return id >= 10000 && id <= 99999;
  }
};
/**
 * Generated a prefixed PeerJs id
 */
const getId = (code?: number | string) =>
  code ? `aperkaz-p2p-chat-${code}` : `aperkaz-p2p-chat-${getCode()}`;

const getConnection = (peer: Peer): DataConnection | null => {
  const connectionIds = Object.keys(peer.connections);

  if (connectionIds.length > 1) throw new Error("too many connections");

  const conn = peer.getConnection(peer.id, connectionIds[0]);

  if (conn?.type === "data") return conn as DataConnection;
  if (conn?.type === "media") return null; // we dont handle media connections for now
  return null;
};

function App() {
  const [code] = useState(getCode);
  const [codeToConnect, setCodeToConnect] = useState<string>("");

  const [peer, setPeer] = useState<Peer>();
  const [conn, setConn] = useState<DataConnection>();

  React.useEffect(() => {
    if (conn || peer) return;

    const newPeer = new Peer(getId(code), { debug: 2 });

    // on open will be launch when you successfully connect to PeerServer
    newPeer.on("open", (id) => {
      console.log(`Created peer: ${id}`);
    });

    newPeer.on("connection", (connection) => {
      connection.on("data", (data) => {
        console.log(`[${connection.peer}] ${data}`);
      });
      connection.on("open", () => {
        console.log(`Connection open with ${connection.peer}`);

        // allows to 2 connections: [p1 -> p2] and [p2 -> p1]
        if (newPeer.connections[connection.peer].length === 1) {
          console.log(
            `Creating connection with ${connection.peer}, since there was none`
          );
          setConn(newPeer?.connect(connection.peer));
        }
      });
    });

    setPeer(newPeer);
  }, [peer, conn]);

  const handleConnect = () => {
    if (!peer) return;
    if (!isValidCode(parseInt(codeToConnect))) return;

    // close previous connection
    if (conn) conn.close();

    console.log(`Trying to connect to: ${getId(codeToConnect)}`);
    setConn(peer.connect(getId(codeToConnect)));
  };

  const handleUpdatePeerId = (event: React.ChangeEvent<HTMLInputElement>) => {
    const peerCode = parseInt(event.target.value);

    if (isNaN(peerCode)) return setCodeToConnect("");

    setCodeToConnect(event.target.value);
  };

  const handleSendMessage = () => {
    if (conn) conn.send(`Hello there!`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>P2P chat</p>
        <p>
          Your Code is: <code>{code}</code>
        </p>

        <input
          type="text"
          name="Peer's ID"
          maxLength={5}
          value={codeToConnect}
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
}

export default App;
