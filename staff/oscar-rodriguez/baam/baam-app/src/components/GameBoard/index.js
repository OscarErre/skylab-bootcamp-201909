import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router'
import './index.sass'
import { retrieveGame, retrieveUser, playCard, passTurn, leaveGame } from '../../logic'
import Context from '../Context'
import GameZone from '../GameZone'
import Card from '../Card'
import WaitTurn from '../WaitTurn'
import EndGame from '../EndGame'


export default function ({ history }) {

    const { feed, setFeed } = useContext(Context)

    const [currentPlayer, setCurrentPlayer] = useState()
    const [enemy, setEnemy] = useState()
    const [game, setGame] = useState()
    const [user, setUser] = useState()
    const [turnChange, setTurnChange] = useState(0)
    const [view, setView] = useState('wait')
    const [endMessage, setEndMessage] = useState({})

    let refresher

    const { gameId } = useParams()
    const { token } = sessionStorage

    useEffect(() => {
        if (typeof refresher !== 'number') {
            refresher = setInterval(() => {
                (async () => {
                    try {      
                        const user = await retrieveUser(token)
                        setUser(user)      
                        const _game = await retrieveGame(gameId, token)
                        let _current = _game.players.findIndex(player => player.user.id === user.id)
                        let _enemy = (_current + 1) % 2
                        if (_game.status === 'READY'){
                            if (_current === _game.currentPlayer) setView('play')
                            else setView('wait')
                            setCurrentPlayer(_current)
                            setEnemy(_enemy)
                            let lastAccess = new Date (_game.players[_enemy].lastAccess).getTime()
                            let timeStamp = new Date ().getTime()
                            if ((timeStamp - lastAccess) > 20000 ) {
                                throw Error (`ups, ${_game.players[_enemy].user.nickname} has left the game`)
                            }}
                        else {
                            if (_game.winner === _current) {
                                setEndMessage({
                                    title : "CONGRATULATIONS! YOU WIN!!",
                                    result : "winner"
                                })
                            } else if (_game.winner === _enemy){
                                setEndMessage({
                                    title : "OUGTH! YOU LOOSE!!",
                                    result : "lose"
                                })
                            } else {
                                setEndMessage({
                                    title : "IT WAS A TIE!!!",
                                    result : "tie"
                                })
                            }
                            
                            clearInterval(refresher)
                            setView('end')
                        }
                        setGame(_game)
                    } catch ({ message }) {
                        delete sessionStorage.gameId
                        clearInterval(refresher)
                        setFeed({ title: "🦖 There was an error:", message })
                        history.push('/')
                    }
                })()
            }, 1000)
        }
        return () => {
            clearInterval(refresher)
        }
    }, [setGame])
    
    function handleDragCard(event, card) {
        console.log('dragging card '+card.name)
        event.dataTransfer.setData("card", JSON.stringify(card))
    }

    async function handleDropCard (event) {
        try {
            event.preventDefault()
            const card = JSON.parse(event.dataTransfer.getData("card"))
            await playCard (gameId, token, card.id)
        } catch ({ message }) {
            setFeed({ title: "🦖 There was an error:", message })
            history.push('/')
        }
    }

    function handleGoHome () { history.push('/') }

    async function handlePassTurn (gameId, token) {
        try {
            await passTurn(gameId, token)
        } catch ({ message }) {
            setFeed({ title: "🦖 There was an error:", message })
            history.push('/')
        }
    }

    async function handleExitGame (gameId, token) {
        try {
            await leaveGame (gameId, token)
        } catch ({ message }) {
            setFeed({ title: "🦖 There was an error:", message })
            history.push('/')
        }
    }

    return <section className="game-panel">
        {view === 'end' && <EndGame title={endMessage.title} status={endMessage.result} onClose={handleGoHome}/>}
        {game && view === 'play' && <>
            <div className="cards-zone">
                {game.players[enemy].hand.map((card, i) => <div key={i} className="card"><img draggable="false" className="card" src="img/backcard.png"></img></div>)}
            </div>
            <div className="user">{game.players[enemy].user.nickname}</div>
            <div className="info info--life">♥️ {game.players[enemy].lifePoints}</div>
            <div className="info info--defense">🛡 {game.players[enemy].defense}</div>
            <div className="info info--attack">⚔️ x{game.players[enemy].attack}</div>
            
            <GameZone gameZone={game.shoots} onDropCard={handleDropCard}/>
            <div className="temp-zone">
                {game.players[enemy].tempZone.card ? <img draggable="false" className="card card--played" src={`img/${game.players[enemy].tempZone.card.image}`}></img> : "TEMP ZONE"}
            </div>
            <div className="discards">
                {game.players[enemy].discards.length > 0 ? <img draggable="false" className="card card--played" src="img/backcard.png"></img> : "DISCARDS"}
            </div>
            {/*++++++++++++++++ ⬆️ENEMY_ZONE   VS   PLAYER_ZONE⬇️  +++++++++++++++++*/}
            <div className="temp-zone">
                {game.players[currentPlayer].tempZone.card ? <img draggable="false" className="card" src={`img/${game.players[currentPlayer].tempZone.card.image}`}></img> : "TEMP ZONE"}
            </div>
            <div className="discards">
                {game.players[currentPlayer].discards.length > 0 ? <img draggable="false" className="card card--played" src="img/backcard.png"></img> : "DISCARDS"}
            </div>
            <div className="info info--life">♥️ {game.players[currentPlayer].lifePoints}</div>
            <div className="info info--defense">🛡 {game.players[currentPlayer].defense}</div>
            <div className="info info--attack">⚔️ x{game.players[currentPlayer].attack}</div>
            <div className="info info--pass" onClick={event=>{event.preventDefault(); handlePassTurn(gameId, token)}}>PASS</div>
            <div className="info info--exit" onClick={event=>{event.preventDefault(); handleExitGame(gameId, token)}}>EXIT</div>
            <div className="cards-zone">
                {game.players[currentPlayer].hand.map((card,i) => <div key={i} className="card"> <Card className={"card"} src={`img/${card.image}`} card={card} onDragCard={handleDragCard} attack={game.players[currentPlayer].attack}/> </div>)}
            </div>
            <div className="user">{game.players[currentPlayer].user.nickname}</div>
        </>
        }   
        {game && view === 'wait' && <WaitTurn /> }
    </section>
}