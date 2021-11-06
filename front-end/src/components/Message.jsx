import React from 'react'

export function Message({messageText, txUrl}) {

    return (
        <div className="message-container">
            <div className="message" onClick={() => window.open(txUrl)}>
                <img src="https://placedog.net/200/200" alt="Friend"></img>
                <p>{messageText}</p>
            </div>
        </div>
    )
}