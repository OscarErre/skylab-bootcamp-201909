import React from 'react'
import './index.sass'

export default function ({onLogin, onRegister}) {

    return <section className="landing">
        <h1 className="landing__title">Welcome to Tasks App</h1>
        <p className="landing__text">proceed to <a href="" onClick={event=>{event.preventDefault(); onRegister()}}>Register</a> or <a href="" onClick={event=>{event.preventDefault(); onLogin()}}>Login</a></p>
    </section>

}