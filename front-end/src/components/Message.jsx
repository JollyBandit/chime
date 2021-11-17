import React from "react";

export function Message(props) {
  return (
    <div className={props.ownMessage ? "message own" : "message"} onClick={() => props.messageClicked(props.postedData)}>
      <img src="https://placedog.net/200/200" alt="Friend"></img>
      <div>
        <div>
          <p id="messageID">User ID</p>
          <p id="messageDate">{props.postedData.date}</p>
        </div>
        <p id="messageText">{props.postedData.message}</p>
        <button onClick={() => props.deleteMessage(props.postedData)}>Delete</button>
      </div>
    </div>
  );
}