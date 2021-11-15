import React, { useState } from "react";

export const SendMessage = ({ sendMessage }) => {
  const [inputValue, setInputValue] = useState("");
  const { ethers } = require("ethers")
  const API_KEY = process.env.REACT_APP_KOVAN_API_KEY;

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

  const priceFeed = () => {
    const provider = new ethers.providers.JsonRpcProvider(API_KEY);
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
    const addr = "0x9326BFA02ADD2366b30bacB125260Af641031331";
    const priceFeed = new ethers.Contract(addr, aggregatorV3InterfaceABI, provider);
    priceFeed.latestRoundData()
        .then((roundData) => {
            // Do something with roundData
            console.log(roundData)
        })

  }

  function createMessageContext(e){
    if(e.target.value.length >= 3){
      console.log("Open message context");
    }
    else{
      console.log("Close message context");
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
      <button id="chainlink-feeds" onClick={() => priceFeed()}>&#x2B21;</button>
      <button id="pick-emoji" onClick={() => console.log("Pick emoji")}>&#x1F60A;</button>
      <button id="message-submit" onClick={(e) => buttonHandler(e)}>Submit</button>
    </section>
  );
};
