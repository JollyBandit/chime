import React from "react";

export function Message({ pData, ownMessage, messageClicked }) {
  return (
    <div className={ownMessage ? "message own" : "message"} onClick={() => messageClicked({pData})}>
      <img src="https://placedog.net/200/200" alt="Friend"></img>
      <div>
        <div>
          <p id="messageID">User ID</p>
          <p id="messageDate">{pData.date}</p>
        </div>
        <p id="messageText">{pData.message}</p>
      </div>
    </div>
  );
}