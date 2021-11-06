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
require('dotenv').config();

export default function App() {
  const [sendData, setSendData] = useState("");
  const [messageToCanvas, setMessageToCanvas] = useState([]);

  // BigchainDB server url
  const DB_PATH = process.env.REACT_APP_DB_PATH;

  const sendOnClick = async () => {
    createMessageTx().then((res) => {
      setMessageToCanvas([messageToCanvas, <Message key={sendData} messageText={res.asset.data.message} txUrl={DB_PATH + "transactions/" + res.id} />,]);
    });
  };

  /*Settings Vars*/
  const disableMessageSharing = true;
  const burnData = true;
  const messagingPrivateKey = "MPK";

  // function sendQueueToBurnAddressOnDisconnect(ownerAddress, dataAddress) {}

  // function sendDataToDeletionQueue(ownerAddress, dataAddress) {}

  //Create a new message and store it on IPDB
  async function createMessageTx() {
    // Create a new keypair
    const userKeyPair = new BigchainDB.Ed25519Keypair(
      bip39.mnemonicToSeedSync("maff").slice(0, 32)
    );

    // Construct a transaction payload
    const tx = BigchainDB.Transaction.makeCreateTransaction(
      // Define the asset to store IMMUTABLE
      {
        user: "User",
        message: sendData,
        datetime: new Date().toString(),
      },

      // Metadata CAN CHANGE LATER
      {
        messagingprivatekey: burnData ? messagingPrivateKey.toString() : "",
        messageshareallowed: disableMessageSharing.toString(),
      },

      // A transaction needs an output
      [
        BigchainDB.Transaction.makeOutput(
          BigchainDB.Transaction.makeEd25519Condition(userKeyPair.publicKey)
        ),
      ],
      userKeyPair.publicKey
    );

    // Sign the transaction with private keys
    const txSigned = BigchainDB.Transaction.signTransaction(
      tx,
      userKeyPair.privateKey
    );

    // Send the transaction off to BigchainDB
    let conn = new BigchainDB.Connection(DB_PATH);

    let final = conn.postTransactionAsync(txSigned).then((res) => {
      console.log("Transaction " + res.id + " posted");
      return(res);
    });
    return (final);
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
