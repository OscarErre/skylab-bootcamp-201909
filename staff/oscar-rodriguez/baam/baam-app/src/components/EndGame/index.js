import React from 'react'
import './index.sass'

export default function ({title, status, onClose}) {

    return <section className="end-game">
            <div className="end-game__back">
            </div>
            <h1 className="end-game__title">{title}</h1>
            <div className="end-game__message">
                <img className="end-game__image" src={`img/${status}.gif`} onClick={ event => {
                    event.preventDefault()
                    onClose()
                }}></img>
            </div>
                    
    </section>
}