import React, { useEffect, useState, useCallback } from "react";
import "./App.css";

import { useEtherBalance, useEthers } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";
import { ethers } from "ethers";

import { ConnectButton } from "./components/ConnectButton";
import { Button } from "@mui/material";
import { Message } from "./components/Message";
import { Friend } from "./components/Friend";
import { SendMessage } from "./components/SendMessage";
import getOrCreateMessageStream, {streamr, getStreamCreation} from "./services/Streamr_API"
import { FriendModal } from "./components/FriendModal";
import { StorageNode } from "streamr-client";

export default function App() {
  const { account, activateBrowserWallet, deactivate } = useEthers();
  const etherBalance = useEtherBalance(account);

  //Component Constructors
  const [messages, setMessages] = useState([]);
  const [friends, setFriends] = useState([])
  const [friendModal, setFriendModal] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState({address: "Select A Friend", streamID: ""});

  function addFriends(address) {
    const storageKey = "chime-friends-" + address;
    const friend = {
      address: address,
      streamID: "",
    }
    if(window.localStorage.getItem(storageKey) === null && ethers.utils.isAddress(address)){
      window.localStorage.setItem(storageKey, JSON.stringify(friend));
      setFriends((oldArr) => [...oldArr, friend]);
      console.log("Added " + window.localStorage.getItem(storageKey))
    }
  }

  async function clickFriend(address){
    //Clear Messages
    setMessages([])
    const storageKey = "chime-friends-" + address;
    setSelectedFriend(JSON.parse(window.localStorage.getItem(storageKey)));
    await streamr.getStream(account.toLowerCase() + "/chime-messages/" + address)
    //Owner stream exists
    .then(async (stream) => {
      console.log("Owner stream exists " + stream);
      setSelectedFriend((oldObj) => ({...oldObj, streamID: stream.id}))
    })
    //Owner stream does not exist
    .catch(async () => {
      await streamr.getStream(address.toLowerCase() + "/chime-messages/" + account)
      //Friend stream exists
      .then(async (stream) => {
        console.log("Friend stream exists " + stream);
        setSelectedFriend((oldObj) => ({...oldObj, streamID: stream.id}))
      })
      //Friend stream doesn't exist
      .catch(async () => {
        console.log("Neither Stream Exists")
        //Create a message stream
        const stream = await getOrCreateMessageStream(address);
        grantPermissions(stream, address)
        // await stream.addToStorageNode(StorageNode.STREAMR_GERMANY);
        setSelectedFriend((oldObj) => ({...oldObj, streamID: stream.id}))
      })
    })
  }

  const grantPermissions = async (_stream, _address) => {
    await _stream.grantPermission("stream_get", _address);
    await _stream.grantPermission("stream_publish", _address);
    await _stream.grantPermission("stream_subscribe", _address);
    await _stream.grantPermission("stream_delete", _address);
  }

  function deleteFriend(address){
      const storageKey = "chime-friends-" + address;
      window.localStorage.removeItem(storageKey);
      const friendArr = [];
      for(const key in window.localStorage){
        if(key.includes("chime-friends")){
          friendArr.push(window.localStorage.getItem(key))
        }
      }
      setFriends(friendArr);
  }

  useEffect(() => {
    function loadFriends() {
      try {
        const friendArr = [];
        //Load friends from local storage
        for(const key in window.localStorage){
          if(key.includes("chime-friends")){
            friendArr.push(JSON.parse(window.localStorage.getItem(key)));
            console.log(friendArr);
          }
        }
        if(friendArr.length > 0)
        setFriends([...friendArr]);

      } catch (err) {
        console.log(err);
      }
    }
    //Load if the user wallet is connected
    if(account){
      loadFriends();
    }
  }, [account])

  useEffect(() => {
    async function loadMessages() {
      try {
        console.log(selectedFriend.streamID);
        //Load the last 50 messages from previous session
        streamr.subscribe(
          {
            stream: selectedFriend.streamID,
            resend: {
              last: 50,
            },
          },
          handleMessages
        )
      } catch (err) {
        console.log(err);
      }
    }
    //Load if the user wallet is connected
    console.log(selectedFriend)
    if(account && messages.length === 0  && selectedFriend.streamID !== ""){
      loadMessages();
    }
  }, [account, selectedFriend])

  const handleMessages = useCallback((message) => {
    setMessages((oldArr) => [...oldArr, {...message}]);
  }, [])

  const formatEthBalance = () => {
    try {
      return formatEther(etherBalance);
    } catch (e) {
      return "";
    }
  };

  const addMessage = async (messageText, messageDate) => {
    try{
      const stream = await streamr.getStream(selectedFriend.streamID);
      await stream.publish({
        sender: account,
        message: messageText,
        date: messageDate
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
    console.log("Delete: " + msg.message)
  }

  function openMessageContext(){
    console.log("Open Message Context");
  }

  const connect = () => {
    activateBrowserWallet();
    console.log(
      "The client attempted to connect"
    );
    streamr.connect()
  };

  const disconnect = () => {
    deactivate();
    console.log(
      "The client has been disconnected"
    );
    setMessages([]);
    if(streamr){
      streamr.getSubscriptions()[0].unsubscribe()
      streamr.disconnect()
    }
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
          <p>{selectedFriend.address}</p>
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
            <FriendModal
              show={friendModal}
              addFriend={(address) => {
                setFriendModal(false);
                addFriends(address);
              }}
              cancel={() => setFriendModal(false)}
            />
            <Button onClick={() => {setFriendModal(!friendModal)}}>Friends</Button>
            <Button onClick={() => console.log(selectedFriend)}>Servers</Button>
          </section>

          <section id="friends-list">
            <div>
              <p>Friends List</p>
              {friends.map((friend) => {
                return (
                  <Friend
                    key={Math.random()}
                    address={friend.address}
                    streamID={friend.streamID}
                    clickFriend={(address) => clickFriend(address)}
                    deleteFriend={(address) => deleteFriend(address)}
                  />
                );
              })}
            </div>
          </section>

          <section id="profile">
            <div id="connect-area">
              <div>
                <div id="current-activity">
                  <a
                    href="https://streamr.network/core"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Reminder: If messages don't show, enable stream storage
                  </a>
                </div>
              </div>
            </div>
            <div>
              <ConnectButton
                account={account}
                connect={connect}
                disconnect={disconnect}
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
            <div>
              {messages.map((message) => {
                return (
                  <Message
                    key={message.date}
                    postedData={message}
                    userAddress={account}
                    clickMessage={(msg) => clickMessage(msg)}
                    deleteMessage={(msg) => deleteMessage(msg)}
                    openMessageContext={(msg) => openMessageContext(msg)}
                  />
                );
              })}
            </div>
          </div>
          <SendMessage
            sendMessage={(messageText, messageDate) =>
              addMessage(messageText, messageDate)
            }
          />
        </section>
      </section>
    </>
  );
}
