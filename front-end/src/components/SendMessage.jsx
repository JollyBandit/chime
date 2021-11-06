import React, { useState } from "react";
import { Button } from "@mui/material";

export let SendMessage = ({ setSendData, sendOnClick }) => {
  const [inputValue, setInputValue] = useState("");

  const keyHandler = (event) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      setSendData(inputValue);

      //createMessage();
      sendOnClick();
      setInputValue("");
    }
  };

  const buttonHandler = (event) => {
    if (inputValue !== "" && inputValue.trim() !== ""){
      setSendData(inputValue);

      //createMessage();
      sendOnClick();
      setInputValue("");
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
        onChange={(e) => setSendData(e.target.value)}
        onInput={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => keyHandler(e)}
      ></input>
      <p>@</p>
      <p>%</p>
      <Button onClick={(e) => buttonHandler(e)}>Submit</Button>
    </section>
  );
};
