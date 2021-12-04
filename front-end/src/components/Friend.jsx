import React, { useState, useEffect, useCallback } from 'react'
import { shortenIfAddress, useSendTransaction } from '@usedapp/core'
import ContextMenu from './ContextMenu'
import { utils } from '@usedapp/core/node_modules/ethers';

export const Friend = (props) => {
    const [anchorPoint, setAnchorPoint] = useState({x: 0, y: 0});
    const { sendTransaction, state } = useSendTransaction();

    function handleContextMenu(e){
        setAnchorPoint({x: e.pageX, y: e.pageY});
        e.preventDefault();
    }

    const handleClick = useCallback(() => setAnchorPoint({x: 0, y: 0}), []);

    useEffect(() => {
        document.addEventListener('click', handleClick);
        return() => {
            document.removeEventListener('click', handleClick);
        }
    })

    return (
        <div 
        className = "friend-container" 
        onClick={() => {
            props.clickFriend(props.address)
        }} 
        onContextMenu={(e) => handleContextMenu(e)}
        >
            <ContextMenu 
            anchorPoint={{x: anchorPoint.x, y: anchorPoint.y}} 
            select={() => {
                props.clickFriend(props.address);
                setAnchorPoint({x: 0, y: 0});
            }} 
            send={() => {
                if(state === 'None'){
                    console.log(state);
                }
                else{
                    console.log("Send Crypto");
                    setAnchorPoint({x: 0, y: 0});
                    sendTransaction({ to: props.address, value: utils.parseEther(".1")});
                }
            }} 
            delete={() => {
                props.deleteFriend(props.address);
                setAnchorPoint({x: 0, y: 0});
            }}
            />
            <img src={"https://robohash.org/" + props.address + ".png?set=set5"} alt="Friend"></img>
            <p>{shortenIfAddress(props.address)}</p>
        </div>
    )
}