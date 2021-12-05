import React, { useState } from 'react'
import { shortenIfAddress, useSendTransaction } from '@usedapp/core'
import ContextMenu from './ContextMenu'
import { utils } from '@usedapp/core/node_modules/ethers';

export const Friend = (props) => {
    const [anchorPoint, setAnchorPoint] = useState({x: 0, y: 0});
    const { sendTransaction, state } = useSendTransaction();

    return (
        <div 
        className = "friend-container" 
        onClick={() => {
            props.clickFriend(props.address)
        }} 
        onContextMenu={(e) => {
            setAnchorPoint({x: e.pageX, y: e.pageY});
            e.preventDefault();
        }}
        >
            <ContextMenu 
            anchorPoint={{x: anchorPoint.x, y: anchorPoint.y}} 
            select={() => props.clickFriend(props.address)} 
            send={() => {
                if(state === 'None'){
                    console.log(state);
                }
                else{
                    sendTransaction({ to: props.address, value: utils.parseEther(".1")});
                }
            }} 
            delete={() => props.deleteFriend(props.address)}
            />
            <img src={"https://robohash.org/" + props.address + ".png?set=set5"} alt="Friend"></img>
            <p>{shortenIfAddress(props.address)}</p>
        </div>
    )
}