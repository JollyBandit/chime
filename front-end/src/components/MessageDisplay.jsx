import React from 'react'

export const MessageDisplay = () => {

    const DUMMY_DATA = [
        {
          senderId: "test1",
          text: "who'll win?"
        },
        {
          senderId: "test2",
          text: "who'll win?"
        },
        {
            senderId: "test1",
            text: "Me?"
        }
      ]

    return (
        <div className="message-display">
            {DUMMY_DATA.map((message, index) => {
                return (
                    <div key={index} className="message">
                        <div className="message-username">{message.senderId}</div>
                        <div className="messgae-text">{message.text}</div>
                    </div>
                )
            })}
        </div>
    )
}
