import React from "react";
import { TokenFeed } from "./TokenFeed";

export function Message(props) {
  const urlRegex = /\b(https?:\/\/.*?\.[a-z]{2,4}\b)/g;

  const message = props.postedData.message;

  const linkArr = [];
  const tokenFeedArr = [];
  const regularMessage = [];

  if(message.match(urlRegex) !== null) {
    // let sel = message.match(urlRegex)[0];
    // const selStartIndex = message.indexOf(sel);
    // const selEndIndex = selStartIndex + message.length;
    // console.log(message.slice(0, selStartIndex));
    // console.log(message.slice(selEndIndex, message.length));
    const link = message.match(urlRegex);
    linkArr.push(
      <a key={link} href={link} target="_blank" rel="noreferrer">
        {link}
      </a>
    );
  }
  else if(message.startsWith("[") && message.endsWith("]")){
    tokenFeedArr.push(
      <TokenFeed
        key={1}
        onClick={() => console.log(message)}
        tokenName={message.substr(1, message.indexOf(",") - 1)}
        tokenPrice={message.substr(message.indexOf(",") + 1, message.length - message.indexOf(",") - 2)}
        hideLiveFeedCheckbox={false}
      />
    )
  }
  else{
    regularMessage.push(
      <p id="messageText" key={message}>
        {message}
      </p>
    )
  }

  return (
    <div
      className={props.ownMessage ? "message own" : "message"}
      onClick={() => props.clickMessage(props.postedData)}
    >
      <img src={"https://robohash.org/" + props.postedData.sender + ".png?set=set5"} alt="User"></img>
      <div>
        <div>
          <p id="messageID">{props.postedData.sender}</p>
          <p id="messageDate">{props.postedData.date}</p>
        </div>
        {/* Message Content */}
        {linkArr}
        {tokenFeedArr}
        {regularMessage}
        <button id="deleteMessage" onClick={() => props.deleteMessage(props.postedData)}>
          X
        </button>
      </div>
    </div>
  );
}
