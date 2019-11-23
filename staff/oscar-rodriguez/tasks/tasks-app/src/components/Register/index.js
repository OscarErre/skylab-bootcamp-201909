import React from 'react'
import './index.sass'

export default function ({onRegister}) {

    return <section className="register">
    <h1 className="register__title">Register</h1>
    <form className="register__form" onSubmit={event => {
        event.preventDefault()
        const { name:{value: name}, surname: {value: surname}, email: { value: email}, password: { value: password}, username: {value: username} } = event.target
        onRegister (name, surname, email, username, password)
    }}>
        <label for="name">Name: <input type="text" name="name" placeholder="name" /></label>
        <label for="surname">Surname: <input type="text" name="surname" placeholder="surname" /></label>
        <label for="email">E-mail: <input type="mail" name="email" placeholder="email" /></label>
        <label for="username">Username: <input type="text" name="username" placeholder="username" /></label>
        <label for="password">Password: <input type="password" name="password" placeholder="passwword" /></label>
        <button>Register</button>
    </form>
</section>
}