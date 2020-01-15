import React from 'react'
import './index.sass'

export default function ({title, message, onClose}) {

    return <section className="feedback">
            <div className="feedback__back">
            </div>
            <div className="feedback__container">
                <div className="feedback__close" onClick={ event => {
                    event.preventDefault()
                    onClose()
                }}>✖︎</div>
                <h1 className="feedback__title">{title}</h1>
                <p className="feedback__message">{message}</p>
            </div>
    </section>
}