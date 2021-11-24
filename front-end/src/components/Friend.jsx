import React from 'react'
import { shortenIfAddress } from '@usedapp/core'

export const Friend = (props) => {
    const account = "0x50369937Aaac54D9657C9a0Cd19357aFe8420f17"
    return (
        <div className = "friend-container">
            <img src={"https://robohash.org/" + account + ".png?set=set5"} alt="Friend"></img>
            <p>{shortenIfAddress(account)}</p>
        </div>
    )
}