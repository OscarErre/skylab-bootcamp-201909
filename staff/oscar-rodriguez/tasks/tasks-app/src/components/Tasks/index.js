import React, {useState, useEffect } from 'react'
import {retrieveUser } from '../../logic'
import './index.sass'
import Board from '../Board'

export default function () {

    const [name, setName] = useState()

    useEffect(() => {
        const { token } = sessionStorage;
        
        (async () => {
            if (token) {
                const { name } = await retrieveUser(token)
        
                setName(name)
            }
        })()
    }, [sessionStorage.token])


    return <section class="tasks">
    <div class="tasks__header tasks-header">
        <div class="tasks-header__title">Task App</div>
        <div class="tasks-header__user">{name}</div>
    </div>
    <Board />
</section>
}