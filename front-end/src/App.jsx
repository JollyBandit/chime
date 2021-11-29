import React, { useEffect, useState, useCallback } from "react";
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

export default function App() {
  const { account, activateBrowserWallet, deactivate } = useEthers();
  const etherBalance = useEtherBalance(account);

  //Component Constructors
  const [messages, setMessages] = useState([]);
  const [friends, setFriends] = useState([])
  const [friendModal, setFriendModal] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState({address: "Select A Friend", streamID: ""});

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
    //Clear Messages
    setMessages([])
    const storageKey = "chime-friends-" + address;
    setSelectedFriend(JSON.parse(window.localStorage.getItem(storageKey)));
    await streamr.getStream(account.toLowerCase() + "/chime-messages/" + address)
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
    if(account && messages.length === 0  && selectedFriend.streamID !== ""){
      loadMessages();
    }
  }, [account, selectedFriend]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMessages = useCallback((message) => {
    setMessages((oldArr) => [...oldArr, {...message}]);
  }, [])

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
          <button className="chime-button">Notifications</button>
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
