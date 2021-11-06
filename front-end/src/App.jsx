import React, { useState } from "react";
// import logo from './logo.svg';
import "./App.css";
import { ChainId, DAppProvider } from "@usedapp/core";

import { ConnectButton } from "./components/ConnectButton";
import { Button } from "@mui/material";
import { Message } from "./components/Message";
import { Friend } from "./components/Friend";
import { SendMessage } from "./components/SendMessage";
import * as BigchainDB from "bigchaindb-driver";
import * as bip39 from "bip39";

export default function App() {
  const [data, setData] = useState("");
  const [sendData, setSendData] = useState("");
  const [messageToCanvas, setMessageToCanvas] = useState([]);

  const sendOnClick = () => {
    console.log(sendData);
    setMessageToCanvas([
      ...messageToCanvas,
      <Message key={sendData} messageText={sendData} />,
    ]);
  };

  //Lookup message on IPDB
  function getMessage() {
    try {
      // BigchainDB server uri
      const API_PATH = "https://test.ipdb.io/api/v1/";

      // Create a new keypair
      const userKeyPair = new BigchainDB.Ed25519Keypair(
        bip39.mnemonicToSeedSync("test").slice(0, 32)
      );

      // Send the transaction off to BigchainDB
      let conn = new BigchainDB.Connection(API_PATH);

      conn
        .getTransaction(
          "2029ba858698520dfa743306634a4a8ef164600c6256b899546ba9f9d7f5a24f "
        )
        .then((res) => {
          console.log(res.asset.data.message);
          setData(res.asset.data.message);
        });
    } catch (e) {
      console.log("BigchainDB failed to post due to: " + e);
    }
  }

  return (
    <DAppProvider
      config={{
        supportedChains: [ChainId.Ropsten],
      }}
    >
      <section id="top-bar">
        <div id="search">
          <input type="text" placeholder="Search..."></input>
        </div>
        <div id="contact">
          <p>Name</p>
        </div>
        <div>
          <input type="text" placeholder="Search..."></input>
        </div>
        <div>
          <Button>Notifications</Button>
        </div>
      </section>
      <section id="content">
        <section id="sidebar-container">
          <section id="browser-servers">
            <Button>Friends</Button>
            <Button>Servers</Button>
          </section>
          <section id="friends-list">
            <p>Friends List</p>
            <button onClick={() => getMessage()}></button>
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
            <Friend />
          </section>
          <section id="profile">
            <div id="connect-area">
              <ConnectButton />
              <div>
                <p>Balance:</p>
                <p>750 Chime</p>
              </div>
            </div>
            <div>
              <div id="self-profile">
                <img src="https://placedog.net/200/200" alt="Me" />
                <p>Name</p>
              </div>
              <div id="current-activity">
                <p>Currently playing: Starcraft</p>
              </div>
            </div>
          </section>
        </section>
        <section id="messages-container">
          <div>
            <div>{messageToCanvas}</div>
          </div>
          <SendMessage setSendData={setSendData} sendOnClick={sendOnClick} />
        </section>
      </section>
    </DAppProvider>
  );
}
