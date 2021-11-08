import React from "react";

export function Message({ messageText, txUrl, ownMessage }) {
  return (
    <div className={ownMessage ? "message own" : "message"} onClick={() => window.open(txUrl)}>
      <img src="https://placedog.net/200/200" alt="Friend"></img>
      <p>{messageText}</p>
    </div>
  );
}
