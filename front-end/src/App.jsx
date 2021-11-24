import React, { useEffect, useState } from "react";
import "./App.css";

import { useEtherBalance, useEthers } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";

import { ConnectButton } from "./components/ConnectButton";
import { Button } from "@mui/material";
import { Message } from "./components/Message";
import { Friend } from "./components/Friend";
import { SendMessage } from "./components/SendMessage";
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

  const [, setMessageToCanvas] = useState(messagesArr);
  const [friendToCanvas, setFriendToCanvas] = useState([]);

  //Initialize IPFS
  useEffect(() => {

    // Create a new seed
    const userKeyPair = bip39.mnemonicToSeedSync(ENTROPY).slice(0, 32);
    console.log(userKeyPair);


    async function ipfsInit(){
      try {
        console.log("Starting IPFS...")
        const ipfs = await IPFS.create({
          repo: './ipfs',
          start: true,
          preload: {
            enabled: false
          },
          EXPERIMENTAL: {
            pubsub: true,
          },
          config: {
            Addresses: {
              Swarm: [
                // Use IPFS dev signal server
                // '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
                // '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
                // Use IPFS dev webrtc signal server
                '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
                '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
                '/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/',
                // Use local signal server
                // '/ip4/0.0.0.0/tcp/9090/wss/p2p-webrtc-star',
              ]
            },
          }
        })
        
        const orbitdb = await OrbitDB.createInstance(ipfs, {
          directory: './orbitdb',
          accessController: {
            write: ['*'],
          }
        })
        
        if(account === "0x98b01D04ab7B40Ffe856Be164f476a45Bf8E5B37"){
          console.log("DB1")
          db = await orbitdb.feed("testing123", { overwrite: true })

          db.events.on('ready', () => console.log("Ready"));
          db.events.on('write', (dbname, heads) => console.log("Wrote to DB!"));
          db.events.on('replicated', (address) => console.log("Replicated with " + address));
          db.events.on('replicate.progress', (address, hash, entry, progress, have) => console.log("replicating " + address));
          db.events.on('load', (address) => console.log("Loading db"));
          db.events.on('load.progress', (address) => console.log("Loading db progress"));

          await db.load()
        }
        else{
          // Test Replication
          const replicatedAddress = '/orbitdb/zdpuB3XDmUaeYXkzGRVVV1TmTPWNg4u742zdcucnBfziXkNJ3/msgTesting2';
          console.log("DB2")
          console.log(OrbitDB.isValidAddress(replicatedAddress));
          db = await orbitdb.feed(replicatedAddress);

          db.events.on('ready', () => console.log("Ready"));
          db.events.on('write', (dbname, heads) => console.log("Wrote to DB!"));
          db.events.on('replicated', (address) => console.log("Replicated with " + address));
          db.events.on('replicate.progress', (address, hash, entry, progress, have) => console.log("replicating " + address));
          db.events.on('load', (address) => console.log("Loading db"));
          db.events.on('load.progress', (address) => console.log("Loading db progress"));

          await db.load()
        }

        console.log("DB is " + db.address);
        await db.load()
        await db.iterator({ limit: -1 }).collect().map(e => console.log(e.payload.value))

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
        console.log("This message's hash is: " + e);
      })
      const postedData = await db.iterator({ limit: 1 }).collect().map((e) => e.payload.value)[0];

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
      "The client attempted to connect"
    );
  };

  const disconnect = () => {
    deactivate();
    console.log(
      "The client has been disconnected"
    );
    messagesArr = [];
    if(db){
      db.close().then(() => console.log("DB closed."));
    }
    connect();
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
              <Friend/>
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
                account={account}
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
