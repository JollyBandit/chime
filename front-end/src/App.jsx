import React, { useEffect, useState } from "react";
import "./App.css";
import Logo from "./chime.png"

import { useEtherBalance, useEthers, useTokenBalance, useContractFunction, useContractCall } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";
import { Contract } from "ethers";
import { ethers, utils } from "ethers";

import { ConnectButton } from "./components/ConnectButton";
import { Message } from "./components/Message";
import { Friend } from "./components/Friend";
import { SendMessage } from "./components/SendMessage";
import { FriendModal } from "./components/FriendModal";

import getOrCreateMessageStream, {streamr} from "./services/Streamr_API"
import ChimeToken from "./chain-info/ChimeToken.json"

const CHIME_ADDRESS = "0x5372f9Ba61d912bd5187281a593D16c0B5F83C44";
const STREAMR_GERMANY = '0x31546eEA76F2B2b3C5cC06B1c93601dc35c9D916';

export default function App() {
  const { account, activateBrowserWallet, deactivate } = useEthers();
  const etherBalance = useEtherBalance(account);

  //Component Constructors
  const [messages, setMessages] = useState([]);
  const [friends, setFriends] = useState([])
  const [friendModal, setFriendModal] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState({address: "Select A Friend", streamID: ""});
  const [loaded, setLoaded] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [messageGuessing, setMessageGuessing] = useState(false);

  //ChimeToken Contract
  const abi = ChimeToken;
  const chimeInterface = new utils.Interface(abi);
  const contract = new Contract(CHIME_ADDRESS, chimeInterface)
  const { send: sendRandomWinner } = useContractFunction(contract, 'randomWinner');
  const { send: sendRandomNumber } = useContractFunction(contract, 'getRandomNumber');

  const winner = useContractCall({
    abi: chimeInterface,
    address: CHIME_ADDRESS,
    method: "winner"
  })

  function addFriends(address) {
    const storageKey = "chime-friends-" + address;
    const friend = {
      address: address,
      streamID: "",
    }
    if(window.localStorage.getItem(storageKey) === null && ethers.utils.isAddress(address)){
      window.localStorage.setItem(storageKey, JSON.stringify(friend));
      setFriends((oldArr) => [...oldArr, friend]);
    }
  }

  async function clickFriend(address){
    //Unsubscribe to last friend before selecting next friend (to prevent duplicate messages)
    selectedFriend.streamID !== "" && await streamr.unsubscribe(selectedFriend.streamID);
    setMessages([]);
    setLoaded(false);
    notifications.forEach(notification => {
      notification.close();
    });
    const storageKey = "chime-friends-" + address;
    setSelectedFriend(JSON.parse(window.localStorage.getItem(storageKey)));
    streamr.getStream(account.toLowerCase() + "/chime-messages/" + address)
    //Owner stream exists
    .then(async (stream) => {
      console.log("Owner's stream exists " + stream);
      setSelectedFriend((oldObj) => ({...oldObj, streamID: stream.id}))
    })
    //Owner stream does not exist
    .catch(async () => {
      await streamr.getStream(address.toLowerCase() + "/chime-messages/" + account)
      //Friend stream exists
      .then(async (stream) => {
        console.log("Friend's stream exists " + stream);
        setSelectedFriend((oldObj) => ({...oldObj, streamID: stream.id}))
      })
      //Friend stream doesn't exist
      .catch(async () => {
        console.log("Neither stream exists - Creating a new one")
        //Create a message stream
        const stream = await getOrCreateMessageStream(address);
        grantPermissions(stream, address)
        await stream.addToStorageNode(STREAMR_GERMANY);
        setSelectedFriend((oldObj) => ({...oldObj, streamID: stream.id}))
      })
    })
    //Check if user has browser notifications toggled on
    if(Notification.permission === "default"){
      Notification.requestPermission()
      .then((e) => {
        console.log(Notification.permission);
      })
    }
  }

  const grantPermissions = async (_stream, _address) => {
    await _stream.grantPermission("stream_get", _address);
    await _stream.grantPermission("stream_publish", _address);
    await _stream.grantPermission("stream_subscribe", _address);
    await _stream.grantPermission("stream_delete", _address);
    await _stream.grantPermission("stream_edit", _address);
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
        let timeoutID;
        const dataArr = [];
        const stream = await streamr.getStream(selectedFriend.streamID);
        const storageNodes = await stream.getStorageNodes();
        //Load the last 50 messages from previous session if messages are being stored
        if(storageNodes.length !== 0){
          await streamr.resend(
            {
              stream: selectedFriend.streamID,
              resend: {
                last: 50,
              },
            }, (data) => {
              //Collect all data
              dataArr.push(data);
              //Reset timer if all data hasn't been gathered yet
              if(timeoutID)
              clearInterval(timeoutID);
              timeoutID = setTimeout(() => {
                //Load messages after all data has been collected
                setMessages((oldArr) => [...oldArr, ...dataArr]);
              }, 100);
            }
          )
          setLoaded(true);
        }
        //Messages are not stored, but we will still load
        else{
          setLoaded(true);
        }
        //Subscribe to stream after messages were resent
        streamr.subscribe(
          {
            stream: selectedFriend.streamID,
          }, (data) => {
            //Create a new notification if the new message was not sent by us & chime is not visible
            if(data.sender !== account && document.visibilityState !== "visible"){
              const notification = new Notification(data.sender + " sent you a message!", {body: data.message, icon: "https://robohash.org/" + data.sender + ".png?set=set5"});
              setNotifications((oldArr) => [...oldArr, notification]);
            }
            setMessages((oldArr) => [...oldArr, data]);
          }
        )
      } catch (err) {
        console.log(err);
      }
    }
    //Load if the user wallet is connected
    if(account && messages.length === 0  && selectedFriend.streamID !== ""){
      loadMessages();
    }
  }, [account, selectedFriend]) // eslint-disable-line react-hooks/exhaustive-deps

  const addMessage = async (messageText, messageDate) => {
    try{
      const stream = await streamr.getStream(selectedFriend.streamID);
      await stream.publish({
        sender: account,
        message: messageText,
        date: messageDate
      })
      if(messageGuessing){
        //Check ChimeToken for winner
        if(winner){
          console.log("Need to reset random number")
          sendRandomNumber();
        }
        //Select winner if number above random is guessed
        else{
          const guess = Math.floor(Math.random() * 100)
          await sendRandomWinner(guess);
          console.log("You guessed: " + guess);
        }
      }
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
    setFriends([]);
    setLoaded(false);
    notifications.forEach(notification => {
      notification.close();
    });
    setSelectedFriend({address: "Select A Friend", streamID: ""});
    if(streamr){
      streamr.getSubscriptions().forEach((sub) => sub.unsubscribe());
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

  const formatEthBalance = () => {
    try {
      return formatEther(etherBalance);
    } catch (e) {
      return "";
    }
  };

  const userBalance = useTokenBalance(CHIME_ADDRESS, account);

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
        <img src={Logo} alt="Chime Logo"></img>
        <div id="contact">
          <p>{selectedFriend.address}</p>
        </div>
        <div>
          <input type="text" placeholder="Search..."></input>
        </div>
        <div>
          <button className="chime-button" onClick={() => console.log("Notifications")}>Notifications</button>
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
            <button className="chime-button" onClick={() => {setFriendModal(!friendModal)}}>Add Friends</button>
            <button className="chime-button" onClick={() => setMessageGuessing(!messageGuessing)}>{messageGuessing ? 
            "Participating in Message Guessing" : 
            "Not Participating in Message Guessing"}
            </button>
          </section>

          <section id="friends-list">
            <div>
              <p>Friends List</p>
              {friends.map((friend) => {
                return (
                  <Friend
                    key={Math.random()}
                    selected={selectedFriend.address === friend.address}
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
                    Access your data here!
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
                {account !== undefined ? 
                (formatEthBalance().substr(0, 6) + " Ethereum") : "Connect Wallet"}
                <br></br>
                {account !== undefined && userBalance !== undefined ? 
                ((ethers.BigNumber.from(userBalance).toBigInt() / (10n ** 18n)).toString() + " Chime") : ""}
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
                    key={Math.random()}
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
            disabled={!loaded}
            sendMessage={(messageText, messageDate) =>
              addMessage(messageText, messageDate)
            }
          />
        </section>
      </section>
    </>
  );
}
