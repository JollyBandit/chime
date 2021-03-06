import React, { useState } from 'react'
import { shortenIfAddress, useSendTransaction } from '@usedapp/core'
import ContextMenu from './ContextMenu'
import { utils } from '@usedapp/core/node_modules/ethers';

export const Friend = (props) => {
    const [anchorPoint, setAnchorPoint] = useState({x: 0, y: 0});
    const { sendTransaction, state } = useSendTransaction();

    return (
        <div 
        className = {props.selected ? "friend-container selected-friend" : "friend-container"} 
        onClick={() => {
            //If not selected, allow user to select friend
            !props.selected && props.clickFriend(props.address)
        }} 
        onContextMenu={(e) => {
            setTimeout(() => setAnchorPoint({x: e.pageX, y: e.pageY}), 1);
            e.preventDefault();
        }}
        >
            <ContextMenu 
            anchorPoint={{x: anchorPoint.x, y: anchorPoint.y}} 
            localAnchorPoint={(ap) => setAnchorPoint(ap)}
            //If not selected, allow user to select friend
            select={() => !props.selected && props.clickFriend(props.address)} 
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