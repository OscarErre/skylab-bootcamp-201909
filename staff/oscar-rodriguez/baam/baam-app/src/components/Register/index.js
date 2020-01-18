import React from 'react'
import './index.sass'

export default function ({ onBack, onRegister }) {
    return <section class="register">
        <h1 class="register__title">Register your account</h1>
        <div class="register__back" onClick={event => onBack()}>⎋</div>
        <form class="register__form" onSubmit={event => {
            event.preventDefault()
            const { name : { value : name},
                    surname : { value : surname}, 
                    email : { value : email}, 
                    nickname : { value : nickname}, 
                    password : { value : password} } = event.target

            onRegister(name, surname, email, nickname, password)
        }}>
            <label for="name">Name: <input type="text" name="name" placeholder="name" /></label>
            <label for="surname">Surname: <input type="text" name="surname" placeholder="surname" /></label>
            <label for="email">E-mail: <input type="mail" name="email" placeholder="email" /></label>
            <label for="nickname">Nickname: <input type="text" name="nickname" placeholder="nickname" /></label>
            <label for="password">Password: <input type="password" name="password" placeholder="passwword" /></label>
            <button>Register</button>
        </form>
        <div class="register__what-is what-is">
            <h2 class="what-is__title">What is Baam!!?</h2>
            <p class="what-is__text">Baam is an strategy versus game. In Baam, you will collect and win new cards to complete your collection.</p>
            <p class="what-is__text">Using your collection you will choose your favorite cards, to create an strategy and try to deffeat your oponent.</p>
            <p class="what-is__text">Let's figth!</p>
        </div>
    </section>
}