import React from 'react'
import './index.sass'

export default function ({onSubmit}) {

    return <form class="login__form" onSubmit={ event => {
        event.preventDefault()
        const { nickname : {value : nickname}, password : {value : password} } = event.target

        onSubmit(nickname,password)
    }}>
                <input type="text" name="nickname" placeholder="nickname"/>
                <input type="password" name="password" placeholder="passwword"/>
                <button>Login</button>
            </form>
}