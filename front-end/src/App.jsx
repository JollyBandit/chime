import React, { useEffect, useState } from "react";
import "./App.css";

import { useEtherBalance, useEthers } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";

import { ConnectButton } from "./components/ConnectButton";
import { Button } from "@mui/material";
import { Message } from "./components/Message";
import { Friend } from "./components/Friend";
import { SendMessage } from "./components/SendMessage";
import getMessageStream, {getStreamCreation, getStreamData} from "./services/Streamr_API"

//Components
let messagesArr = [];

export default function App() {
  const { account, activateBrowserWallet, deactivate} = useEthers();
  const etherBalance = useEtherBalance(account);

  const [, setMessageToCanvas] = useState(messagesArr);
  const [friendToCanvas, setFriendToCanvas] = useState([]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const streamDataArr = await getStreamData();
        messagesArr = streamDataArr.map(e =>
        <Message
          key={e.timestamp}
          postedData={e.content}
          userAddress={account}
          clickMessage={(msg) => clickMessage(msg)}
          deleteMessage={(msg) => deleteMessage(msg)}
          openMessageContext={(msg) => openMessageContext(msg)}
        />,
        );
        // Add a new message to the app
        setMessageToCanvas(messagesArr);
  
      } catch (err) {
        console.log(err);
      }
    }
    //Load if the user wallet is connected
    if(account){
      loadMessages();
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
      const stream = await getMessageStream();
      await stream.publish({
        sender: account,
        message: messageText,
        date: messageDate
      })
      .then((e) => {
        //Add a new message to the app
        messagesArr = [
        ...messagesArr,
        <Message
          key={e.streamMessage.messageId.timestamp}
          postedData={e.streamMessage.parsedContent}
          userAddress={account}
          clickMessage={(msg) => clickMessage(msg)}
          deleteMessage={(msg) => deleteMessage(msg)}
          openMessageContext={(msg) => openMessageContext(msg)}
        />,
        ];
        setMessageToCanvas(messagesArr);
      })
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
    console.log("Delete: " + msg)
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
            <Button onClick={async () => console.log(await getStreamCreation())}>Servers</Button>
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
