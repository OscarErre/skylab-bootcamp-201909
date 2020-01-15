import React, {useState, useEffect} from 'react'
import './index.sass'
import {retrievePendingGames} from '../../logic'


export default function ({ onJoin, onClose}) {

    const [games, setGames] = useState()
    const [feed, setFeed] = useState()
    let refresher

    useEffect(() => {
        if (typeof refresher !== 'number') refresher = setInterval(()=> {
            (async () => {
                
                try {
                    const games = await retrievePendingGames ()
                    setGames(games)
                } catch ({message}) {
                    setFeed({ title: "🦖 There was an error:", message })
                } 
            })()
        }, 500)
        return () => {clearInterval(refresher)}
    }, [setGames])

    return <section className="game">
        <div className="game__back">
        </div>
        <div className="game__container">
            <div className="game__close" onClick={event => {
                event.preventDefault()
                onClose()
            }}>✖︎</div>
            <h1 className="game__title">🎮 Theese are the avaiable games:</h1>
            <ul className="game__list">
                {games && games.map(game => <li className="game__list-item" key={game.id} onClick={event => {
                    event.preventDefault()
                    event.stopPropagation()
                    onJoin(game.id)
                }
                }> 🤖 >> {game.nickname}</li>)}
            </ul>
        </div>
    </section>
}