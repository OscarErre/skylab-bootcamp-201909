import React, { useState, useEffect, useContext} from 'react'
import './index.sass'
import { retrieveGame } from '../../logic'
import Context from '../Context'

export default function ({ onClose, gameId, history, onChangeStatus }) {

    const { feed, setFeed } = useContext(Context)
    let refresher

    useEffect(() => {
        if (typeof refresher !== 'number') refresher = setInterval(() => {
            (async () => {
                try {
                    const { token } = sessionStorage
                    const game = await retrieveGame(gameId, token)
                    if (game.status === 'READY' && game.players[1].hand.length > 0){
                        onChangeStatus(gameId)
                    } 
                } catch ({ message }) {
                    setFeed({ title: "🦖 There was an error:", message })
                }
            })()
        }, 1000)
        return () => { clearInterval(refresher) }
    }, [])

    return <section className="waiting">
        <div className="waiting__back">
        </div>
        <div className="waiting__container">
            <div className="waiting__close" onClick={event => {
                event.preventDefault()
                onClose(gameId)
            }}>✖︎</div>
            <img className="waiting__img" src="../img/waiting.gif"></img><h1 className="waiting__title"> Waiting your oponent to join... </h1><img className="waiting__img" src="../img/waiting.gif"></img>
        </div>
    </section>
}