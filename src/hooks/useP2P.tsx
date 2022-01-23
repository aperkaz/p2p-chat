import React, { useState, useCallback, useMemo, createContext } from "react";

import Peer, { DataConnection } from "peerjs";

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

type ContextType = {
  data: {
    status: "disconnected" | "initialized" | "connected";
    code: number;
  };
  methods: {
    /**
     * Connect with another peer, using their code
     */
    connect: (code: ContextType["data"]["code"]) => void;
    /**
     * Exit and clean up the current connection.
     */
    disconnect: () => void;
    /**
     * Send a message to the connected peer.
     */
    sendMessage: (msg: string) => void;
  };
};

const Context = createContext<ContextType | undefined>(undefined);

export const PeerToPeerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [code] = useState(getCode);
  const [peer, setPeer] = useState<Peer>();
  const [connection, setConnection] = useState<DataConnection>();

  // initialize connection with the PeerJS broker server
  React.useEffect(() => {
    if (connection || peer) return;

    console.log("initializing p2p");
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

        // Setup bidirecctional communication automatically
        // allows to 2 connections: [p1 -> p2] and [p2 -> p1]
        if (newPeer.connections[connection.peer].length === 1) {
          console.log(
            `Creating connection with ${connection.peer}, since there was none`
          );
          setConnection(newPeer?.connect(connection.peer));
        }
      });
      connection.on("close", () => {
        console.log(`Connection closed with ${connection.peer}`);
      });
    });

    setPeer(newPeer);
  }, [peer, connection, setPeer]);

  const connect: ContextType["methods"]["connect"] = useCallback(
    (code) => {
      console.log(`Trying to connect to: ${getId(code)}`);
      console.log(peer);

      if (!peer) throw new Error("The PeerJS peer is not initialized yet.");
      if (!isValidCode(code)) throw new Error("Invalid code.");
      if (connection) throw new Error("A connection already exists.");

      setConnection(peer.connect(getId(code)));
    },
    [peer, connection, setConnection]
  );

  const disconnect: ContextType["methods"]["disconnect"] = () => {
    connection?.close();
    peer?.disconnect();
  };

  const sendMessage: ContextType["methods"]["sendMessage"] = (msg) => {
    console.log(`Trying to send message: ${msg}`);

    if (!connection) throw new Error("There is no open connection");
    connection.send(msg);
  };

  const value: ContextType = useMemo(
    () => ({
      data: {
        status: peer
          ? connection
            ? "connected"
            : "initialized"
          : "disconnected",
        code,
      },
      methods: {
        connect,
        disconnect,
        sendMessage,
      },
    }),
    [peer, connection, connect, disconnect, sendMessage]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

/**
 * Expose p2p connection functionality and state, as a hook.
 */
export const usePeerToPeer = () => {
  const context = React.useContext(Context);
  if (context === undefined) {
    throw new Error("usePeerToPeer must be used within a provider");
  }

  return context;
};
