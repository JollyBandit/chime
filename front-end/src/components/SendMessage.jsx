import React, { useState } from "react";
import { Button } from "@mui/material";

export let SendMessage = ({ setSendData, sendOnClick }) => {
  const [inputValue, setInputValue] = useState("");
  const [txUrl, setTxUrl] = useState();

  const keyHandler = (event) => {
    if (event.key === "Enter" && inputValue !== "") {
      setSendData(inputValue);
      //createMessage();
      sendOnClick();
      console.log(event);
      setInputValue('');
    }
  };

  const buttonHandler = (event) => {
    if (inputValue !== "") {
      setSendData(inputValue);
      //createMessage();
      sendOnClick();
      console.log(event);
      setInputValue('');
    }
  };

  return (
    <section id="send-message">
      <p>+</p>
      <input
        id="message-text"
        name="message"
        type="text"
        placeholder="Message"
        autoComplete="off"
        value={inputValue}
        
        //setSendData & setInputValue needs refactoring
        onChange={(e) => setSendData(e.target.value)}
        onInput={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => keyHandler(e)}
      ></input>
      <p>@</p>
      <p>%</p>
      <a target="_blank" href={txUrl} value={txUrl}>
        Hello this is a URL
      </a>
      <Button onClick={(e) => buttonHandler(e)}>Submit Message</Button>
    </section>
  );
};
