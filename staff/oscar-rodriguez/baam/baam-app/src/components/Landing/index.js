import React from 'react'
import './index.sass'
import Login from '../Login'
export default function ({onLogin, onGoToRegister}) {

    return <section className="landing">
                <div className="landing__title-container">
                    <h1 className="landing__title">Welcome to</h1>
                    <img className="landing__logo" src='img/logo.png'></img>
                </div>
            <section className="landing__login login">
                <Login onSubmit={onLogin}/>
            </section>
            <div className="landing__go-register">New here? <a href="" onClick={event => {
                event.preventDefault()
                onGoToRegister()
            }}>Sign-up</a> and create an account</div>
        </section>
}