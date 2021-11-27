import React from 'react'
import { shortenIfAddress } from '@usedapp/core'

export const Friend = (props) => {
    return (
        <div className = "friend-container" onClick={() => props.clickFriend(props.address)}>
            <img src={"https://robohash.org/" + props.address + ".png?set=set5"} alt="Friend"></img>
            <p>{shortenIfAddress(props.address)}</p>
            <button className="deleteButton" onClick={() => props.deleteFriend(props.address)}>X</button>
        </div>
    )
}