import React, { useState } from "react";
import { TokenFeed } from "./TokenFeed";
import ContextMenu from "./ContextMenu";

export function Message(props) {
  const [anchorPoint, setAnchorPoint] = useState({x: 0, y: 0});

  const urlRegex = (/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/g);

  const message = props.postedData.message;

  const imgArr = [];
  const linkArr = [];
  const tokenFeedArr = [];
  const regularMessage = [];

  if(message.includes("ipfs")){
    imgArr.push(
      <img key={message} src={message} alt={message} width="100px" height="100px"></img>
    )
  }
  else if(message.match(urlRegex) !== null) {
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
      onContextMenu={(e) => {
            setAnchorPoint({x: e.pageX, y: e.pageY});
            e.preventDefault();
      }}
    >
      <ContextMenu 
      options={["copy", "delete"]}
      anchorPoint={{x: anchorPoint.x, y: anchorPoint.y}} 
      copy={() => {
          navigator.clipboard.writeText(props.postedData.message);
          setAnchorPoint({x: 0, y: 0});
      }} 
      delete={() => {
          props.deleteMessage(props.postedData);
          setAnchorPoint({x: 0, y: 0});
      }}
      />
      <img src={"https://robohash.org/" + props.postedData.sender + ".png?set=set5"} alt="User"></img>
      <div>
        <div>
          <p id="messageID">{props.postedData.sender}</p>
          <p id="messageDate">{props.postedData.date}</p>
        </div>
        {/* Message Content */}
        {imgArr}
        {linkArr}
        {tokenFeedArr}
        {regularMessage}
        <button className="chime-button" id="deleteMessage" onClick={() => props.deleteMessage(props.postedData)}>
          X
        </button>
      </div>
    </div>
  );
}
