import React, {useState} from 'react'

export function Message({messageText}) {
  
    return (
        <div className="message-container">
            <div className="message">
                <img src="https://placedog.net/200/200" alt="Friend"></img>
                <p>{messageText}</p>
            </div>
        </div>
    )
}