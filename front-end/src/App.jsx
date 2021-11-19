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

const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');

const ENTROPY = process.env.REACT_APP_ENTROPY;

//Database Instance
let db;

//Components
let messagesArr = [];

export default function App() {
  const { account, activateBrowserWallet, deactivate } = useEthers();
  const etherBalance = useEtherBalance(account);

  const [ownerAddress, setOwnerAddress] = useState("");

  const [, setMessageToCanvas] = useState(messagesArr);
  const [friendToCanvas, setFriendToCanvas] = useState([]);

  //Initialize IPFS
  useEffect(() => {

    // Set shortened account address
    setOwnerAddress(shortenIfAddress(account));

    // Create a new keypair
    const userKeyPair = new BigchainDB.Ed25519Keypair(
      bip39.mnemonicToSeedSync(ENTROPY).slice(0, 32)
    );

    async function ipfsInit(){
      try {
        console.log("Starting IPFS...")
        const ipfs = await IPFS.create({
          preload: { enabled: false },
          repo: './ipfs',
          start: true,
          EXPERIMENTAL: {
            pubsub: true,
          },
        })
        const orbitdb = await OrbitDB.createInstance(ipfs, {
          directory: './orbitdb/'+ userKeyPair.publicKey
        })
        console.log("IPFS Initialized")
        db = await orbitdb.feed(userKeyPair.toString(), { overwrite: true })
        await db.load()

      } catch (e) {
        console.error(e)
      }
    }

    async function loadMessages() {
      try {
        messagesArr = await db.iterator({ limit: -1 }).collect().map(e => 
        <Message
          key={e.payload.value.date}
          postedData={e.payload.value}
          userAddress={account}
          clickMessage={(msg) => clickMessage(msg)}
          deleteMessage={(msg) => deleteMessage(msg)}
          openMessageContext={(msg) => openMessageContext(msg)}
        />,
        );
        //Add a new message to the app
        setMessageToCanvas(messagesArr);

      } catch (err) {
        console.log(err);
      }
    }

    //LOAD MESSAGES
    if(account !== undefined){
      ipfsInit().then(() => {
        loadMessages();
        //Database Location
        console.log('./orbitdb/'+ userKeyPair.publicKey);
      });
    }
  }, [account])

  const formatEthBalance = () => {
    try {
      return formatEther(etherBalance);
    } catch (e) {
      return "";
    }
  };

  const addMessage = async (messageText, messageDate) => {
    try{
      await db.add({sender: account, message: messageText, date: messageDate }).then(e => {
        console.log(e);
      })
      const postedData = await db.iterator({ limit: 1 }).collect().map((e) => e.payload.value)[0];
      console.log(postedData);

      //Add a new message to the app
      messagesArr = [
      ...messagesArr,
      <Message
        key={postedData.date}
        postedData={postedData}
        userAddress={account}
        clickMessage={(msg) => clickMessage(msg)}
        deleteMessage={(msg) => deleteMessage(msg)}
        openMessageContext={(msg) => openMessageContext(msg)}
      />,
      ];
      setMessageToCanvas(messagesArr);
    }
    catch(err){
      alert("Please connect your wallet before using Chime.");
      console.log(err);
    }
  };

  function clickMessage(msg){
    try {
      console.log(msg);
    } catch (e) {
      console.error(e)
    }
  }

  async function deleteMessage(msg){
    const dbEntry = db.iterator({ limit: -1 }).collect().filter(e => e.payload.value === msg)[0];
    db.remove(dbEntry.hash).then(hash => {
      //Remove targeted message from database
      db.remove(hash);
      //Filter the remaining messages (except target) and set that to be the new array
      messagesArr = messagesArr.filter(message => message.props.postedData !== msg);
      //Update application render
      setMessageToCanvas(messagesArr);
      console.log("Deleted: " + dbEntry.hash)
    });
  }

  function openMessageContext(){
    console.log("Open Message Context");
  }

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
  // const disableMessageSharing = true;
  // const burnData = true;
  // const messagingPrivateKey = "MPK";

  // function sendQueueToBurnAddressOnDisconnect(ownerAddress, dataAddress) {}

  // function sendDataToDeletionQueue(ownerAddress, dataAddress) {}

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
            <Button onClick={() => console.log(db.address.root)}>Servers</Button>
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
            <div>{messagesArr}</div>
          </div>
          <SendMessage sendMessage={(messageText, messageDate) => addMessage(messageText, messageDate)} />
        </section>
      </section>
    </>
  );
}
