import React, { useState } from "react";
import { MessageContext } from "./MessageContext";
import { ChainlinkFeeds } from "./ChainlinkFeeds";
import { EmojiMenu } from "./EmojiMenu";
const { ethers } = require("ethers")

export const SendMessage = ({ sendMessage }) => {
  const [inputValue, setInputValue] = useState("");
  const [showContext, setShowContext] = useState();
  const [showEmojiMenu, setShowEmojiMenu] = useState();
  const [showChainlinkFeeds, setShowChainlinkFeeds] = useState();
  
  // const KOVAN_API_KEY = process.env.REACT_APP_KOVAN_API_KEY;
  const MAINNET_API_KEY = process.env.REACT_APP_MAINNET_API_KEY

  const keyHandler = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {

      //createMessage();
      sendMessage(inputValue, new Date().toString());
      setInputValue("");
    }
  };

  const buttonHandler = (e) => {
    if (inputValue.trim() !== ""){

      //createMessage();
      sendMessage(inputValue, new Date().toString());
      setInputValue("");
    }
  };

  const priceFeed = (addr) => {
    const provider = new ethers.providers.JsonRpcProvider(MAINNET_API_KEY);
    const aggregatorV3InterfaceABI = [
      {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "description",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
        name: "getRoundData",
        outputs: [
          { internalType: "uint80", name: "roundId", type: "uint80" },
          { internalType: "int256", name: "answer", type: "int256" },
          { internalType: "uint256", name: "startedAt", type: "uint256" },
          { internalType: "uint256", name: "updatedAt", type: "uint256" },
          { internalType: "uint80", name: "answeredInRound", type: "uint80" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "latestRoundData",
        outputs: [
          { internalType: "uint80", name: "roundId", type: "uint80" },
          { internalType: "int256", name: "answer", type: "int256" },
          { internalType: "uint256", name: "startedAt", type: "uint256" },
          { internalType: "uint256", name: "updatedAt", type: "uint256" },
          { internalType: "uint80", name: "answeredInRound", type: "uint80" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "version",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ];
    const priceFeed = new ethers.Contract(addr, aggregatorV3InterfaceABI, provider);
    return priceFeed.latestRoundData();
  }

  function createChainlinkFeeds(e){
    if(e._reactName === 'onClick' && showChainlinkFeeds === undefined){
      setShowChainlinkFeeds(
        <ChainlinkFeeds
          tokenAddress={(e) => {
            priceFeed(e).then(roundData => {
              setInputValue(inputValue + ethers.BigNumber.from(roundData.answer._hex).toBigInt());
              createChainlinkFeeds(e);
            });
          }}
          onBlur={(e) => createChainlinkFeeds(e)}
          tokenPrice={priceFeed("0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c")}
        />
      );
    }
    else{
      setShowChainlinkFeeds(undefined);
    }
  }

  function createEmojiMenu(e){
    if(e._reactName === 'onClick' && showEmojiMenu === undefined){
      setShowEmojiMenu(
        <EmojiMenu
          value={(e) => {
            setInputValue(inputValue + e);
            createEmojiMenu(e);
          }}
          onBlur={(e) => createEmojiMenu(e)}
        />
      )
    }
    else{
      setShowEmojiMenu(undefined);
    }
  }

  function createMessageContext(e){
    if(e.target.value.length >= 3 && (e.target.value[0] === ":" || e.target.value[0] === "/")){
      console.log("Open message context");
      setShowContext(
      <MessageContext
        value={(e) => setInputValue(inputValue + e)}
        onBlur={(e) => createMessageContext(e)}
      />
      );
    }
    else{
      setShowContext(undefined);
    }
  }

  return (
    <section id="send-message">
      <button id="add-file" onClick={() => console.log("Add File")}>+</button>
      <input
        id="message-text"
        name="message"
        type="text"
        placeholder="Message"
        autoComplete="off"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onInput={(e) => createMessageContext(e)}
        onKeyPress={(e) => keyHandler(e)}
      ></input>
      {showContext}
      <button id="chainlink-feed"
        onClick={(e) => createChainlinkFeeds(e)}
      >&#x2B21;</button>
      {showChainlinkFeeds}
      <button id="pick-emoji"
        onClick={(e) => createEmojiMenu(e)}
      >&#x1F60A;</button>
      {showEmojiMenu}
      <button id="message-submit" onClick={(e) => buttonHandler(e)}>Submit</button>
    </section>
  );
};
