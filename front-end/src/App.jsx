import React, { useEffect, useState } from "react";
import "./App.css";

import { shortenIfAddress, useEtherBalance, useEthers } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";

import { ConnectButton } from "./components/ConnectButton";
import { Button } from "@mui/material";
import { Message } from "./components/Message";
import { Friend } from "./components/Friend";
import { SendMessage } from "./components/SendMessage";
import * as BigchainDB from "bigchaindb-driver";
import * as bip39 from "bip39";
require("dotenv").config();

export default function App() {
  const { account, activateBrowserWallet, deactivate } = useEthers();
  const etherBalance = useEtherBalance(account);

  const [sendData, setSendData] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");

  const [messageToCanvas, setMessageToCanvas] = useState([]);
  const [friendToCanvas, setFriendToCanvas] = useState([]);

  useEffect(() => {
    setOwnerAddress(formatAddress());
  });

  // BigchainDB server url
  const DB_PATH = process.env.REACT_APP_DB_PATH;

  const formatAddress = () => {
    return shortenIfAddress(account);
  };

  const formatEthBalance = () => {
    try {
      return formatEther(etherBalance);
    } catch (e) {
      return "";
    }
  };

  const sendOnClick = async () => {
    createMessageTx().then((res) => {
      setMessageToCanvas([
        messageToCanvas,
        <Message
          key={sendData}
          messageText={res.asset.data.message}
          txUrl={DB_PATH + "transactions/" + res.id}
          ownMessage={false}
        />,
      ]);
    });
  };

  const connect = () => {
    activateBrowserWallet();
    console.log(
      "The client has been connected, here is their address: " + ownerAddress
    );
  };

  const disconnect = () => {
    deactivate();
    console.log(
      "The client has been disconnected, here is their address: " + ownerAddress
    );
    // if(disableMessageSharing){
    //   console.log("Encrypting messages to owner's address");
    // }
    // console.log("Encrypt messages");
    // if(burnData){
    //   console.log("Sending messages to burn address");
    // }
    // else{
    //   console.log("Storing on BigchainDB");
    // }
    // console.log("Delete local data");
    // console.log("Stop Chime");
  };

  function addToFriends() {
    let count = 0;
    setFriendToCanvas([friendToCanvas, <Friend key={count++} />]);
  }

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
      return res;
    });
    return final;
  }

  //Lookup message on IPDB
  function getMessage() {
    try {
      // Send the transaction off to BigchainDB
      let conn = new BigchainDB.Connection(DB_PATH);

      conn
        .listTransactions(
          "c6275a4ed6442604c6e2e32acb7560ec55dc656f6b09d61ae00e987cd8501570"
        )
        .then((res) => {
          console.log(res.id);
        });
    } catch (e) {
      console.log("BigchainDB failed to post due to: " + e);
    }
  }

  return (
    <>
      {/* Top Bar */}

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

      {/* Content Section */}

      <section id="content">
        <section id="sidebar-container">
          <section id="browser-servers">
            <Button onClick={() => addToFriends()}>Friends</Button>
            <Button onClick={() => console.log("Server")}>Servers</Button>
            <Button onClick={() => getMessage()}>Test Get Messages</Button>
          </section>

          <section id="friends-list">
            <div>
              <p>Friends List</p>
              {friendToCanvas}
            </div>
          </section>

          <section id="profile">
            <div id="connect-area">
              <div>
                <div id="current-activity">
                  <p>Currently playing: Starcraft</p>
                </div>
              </div>
            </div>
            <div>
              <ConnectButton
                connect={connect}
                disconnect={disconnect}
                ownerAddress={ownerAddress}
              />
              <p>
                {formatEthBalance().substr(0, 6) +
                  (account !== undefined ? " Ethereum" : "Connect Wallet")}
              </p>
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
    </>
  );
}
