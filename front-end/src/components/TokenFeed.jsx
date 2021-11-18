import React, { useState } from "react";
import Icon from "react-crypto-icons";

export const TokenFeed = (props) => {
    const [liveFeed, setLiveFeed] = useState(false);

  return (
    <section id="token-feed" onClick={() => props.onClick()}>
    <div className={liveFeed ? "wave water" : "wave water static-feed"}></div>
    <div className={liveFeed ? "wave water" : "wave water static-feed"}></div>
    <div className={liveFeed ? "wave water" : "wave water static-feed"}></div>
    <div className={liveFeed ? "wave water" : "wave water static-feed"}></div>
    <input className={props.hideLiveFeedCheckbox ? "hideLiveFeedCheckbox" : ""} type="checkbox" onChange={(e) => setLiveFeed(e.target.checked)}></input>
      <div>
        {/* Toggle Live Feed */}
        <Icon name={props.tokenName.toString().toLowerCase()} size={25} />
        <h1>{props.tokenName}</h1>
      </div>
      <p>{props.tokenPrice}</p>
      <div id="credit-div">
        <p>Powered by</p>
        <p id="credit">Chainlink</p>
      </div>
    </section>
  );
};
