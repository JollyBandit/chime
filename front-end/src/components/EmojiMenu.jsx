import React from 'react'

export const EmojiMenu = (props) => {
    return (
        <section className="overlay" id="emoji-menu" onBlur={(e) => props.onBlur(e)}>
            <button onClick={() => props.value("😃")}>&#x1F603;</button>
            <button onClick={() => props.value("👋")}>&#x1F44B;</button>
            <button onClick={() => props.value("🤣")}>&#x1F923;</button>
            <button onClick={() => props.value("🤗")}>&#x1F917;</button>
            <button onClick={() => props.value("🤠")}>&#x1F920;</button>
        </section>
    )
}
