import React from 'react';
// import logo from './logo.svg';
import './App.css';
import {ChainId, DAppProvider, shortenAddress, shortenIfAddress, useEthers} from "@usedapp/core";

import {ConnectButton} from "./components/ConnectButton";
import {MessageDisplay} from "./components/MessageDisplay";
import { Button } from '@mui/material';
import { Message } from './components/Message';
import { Friend } from "./components/Friend";
import { format } from 'path';

function App() {

  const {account, activateBrowserWallet} = useEthers();

  const formatAddress = () => {
    return shortenIfAddress(account);
  }

  return (
  <DAppProvider config={{
    supportedChains: [ChainId.Ropsten]
  }}>
    <section id="top-bar">
      <div id="search">
        <input type="text" placeholder="Search..."></input>
      </div>
      <div id="contact">
        <p>Name</p>
      </div>
      <div>
        <input type="text" placeholder="Search..."></input>
      </div>
      <div>
        <Button>Notifications</Button>
      </div>
    </section>
    <section id="content">
      <section id="sidebar-container">
        <section id="browser-servers">
          <Button>Friends</Button>
          <Button>Servers</Button>
        </section>
        <section id="friends-list">
          Friends List
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
          {<Friend/>}
        </section>
        <section id="profile">
          {<ConnectButton/>}
        </section>
      </section>
      <section id="messages-container">
          <section id="messages">
            {<Message/>}
            {<Message/>}
            {<Message/>}
            {<Message/>}
            {<Message/>}
            {<Message/>}
            {<Message/>}
            {<Message/>}
        </section>
        <section id="send-message">
          <p>+</p>
          <input id="message-text" name="message" type="text" placeholder={"Message "+ formatAddress()} autoComplete = "off"></input>
          <p>@</p>
          <p>%</p>
        </section>
      </section>
    </section>
  </DAppProvider>
  );
}

export default App;
