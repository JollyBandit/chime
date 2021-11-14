import React, { useState } from "react";

export const SendMessage = ({ sendMessage }) => {
  const [inputValue, setInputValue] = useState("");

  const keyHandler = (event) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {

      //createMessage();
      sendMessage(inputValue, new Date().toString());
      setInputValue("");
    }
  };

  const buttonHandler = (event) => {
    if (inputValue.trim() !== ""){

      //createMessage();
      sendMessage(inputValue, new Date().toString());
      setInputValue("");
    }
  };

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
        onInput={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => keyHandler(e)}
      ></input>
      <button id="chainlink-feeds" onClick={() => console.log("Open pricefeed selection")}>&#x2B21;</button>
      <button id="pick-emoji" onClick={() => console.log("Pick emoji")}>&#x1F60A;</button>
      <button id="message-submit" onClick={(e) => buttonHandler(e)}>Submit</button>
    </section>
  );
};
