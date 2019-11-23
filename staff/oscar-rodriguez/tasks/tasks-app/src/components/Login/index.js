import React from 'react'
import './index.sass'

export default function ({ onLogin }) {
    return <section className="login">
        <h1 className="login__title">Login</h1>
        <form className="login__form" onSubmit={event => {
            event.preventDefault()
            const { username: { value: username }, password: { value: password } } = event.target
            onLogin(username, password)
        }}>
            <label for="username">Username: <input type="text" name="username" placeholder="username" /></label>
            <label for="username">Password: <input type="password" name="password" placeholder="password" /></label>
            <button>Login</button>
        </form>
    </section>
}