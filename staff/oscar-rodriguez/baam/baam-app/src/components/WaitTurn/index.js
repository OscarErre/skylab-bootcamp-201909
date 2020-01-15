import React from 'react'
import './index.sass'

export default function () {

    return <section className="turn">
        <div className="turn__back">
        </div>
        <div className="turn__container">
            <h1 className="turn__title"> Wait your turn, don't be impatient!</h1>
            <div className="turn__img-container">
                <img className="turn__img" src="../img/waitingTurn.gif"></img>
            </div>
        </div>
    </section>
}