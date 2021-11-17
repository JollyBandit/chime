import React from "react";

export const TokenFeed = (props) => {
  return (
    <section id="token-feed" onClick={() => props.onClick()}>
      <div>
        <img src="#logo" alt="#logo"></img>
        <h1>{props.tokenName}</h1>
      </div>
      <p>{props.tokenPrice}</p>
    </section>
  );
};