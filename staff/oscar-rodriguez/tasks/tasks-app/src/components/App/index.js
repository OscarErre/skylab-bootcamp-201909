import React from 'react';
import './index.sass'
import Landing from '../Landing'
import Register from '../Register'
import Login from '../Login'
import Tasks from '../Tasks'
import { Route, withRouter } from 'react-router-dom'
import {authenticateUser, registerUser} from '../../logic'

export default withRouter (function ( {history }) {
    function handleGoToLogin () {history.push('./login')}
    function handleGoToRegister () {history.push('./register')}
    async function handleLogin (username, password) {
        try {
            const token = await authenticateUser (username, password)

            sessionStorage.token = token
debugger
            history.push ('/tasks')
        } catch (error) {
            console.log(error)
        }
    }
    async function handleRegister (name, surname, email, username, password) {
        try {
            await registerUser (name, surname, email, username, password)

            history.push('/login')
        } catch (error) {
            console.log(error)
        }
    }
    return <>
        <Route exact path='/' render={()=><Landing onLogin={handleGoToLogin} onRegister={handleGoToRegister}/>} />
        <Route path='/register' render={()=><Register onRegister={handleRegister}/>} />
        <Route path='/login' render={()=> <Login onLogin={handleLogin}/>} />
        <Route path='/tasks' render={()=> <Tasks />}/>
    </>
})
