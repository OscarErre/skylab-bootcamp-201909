import React, { useState, useEffect } from "react"
import { Route, withRouter, Redirect } from 'react-router-dom'
import './index.sass'
import Landing from '../Landing'
import Register from '../Register'
import Home from '../Home'
import YourCards from '../YourCards'
import NewCards from '../NewCards'
import SelectHand from '../SelectHand'
import GameBoard from '../GameBoard'
import Feedback from '../Feedback'
import Game from '../Game'
import JoinGame from '../JoinGame'
import WaitPartner from '../WaitPartner'
import Context from '../Context'


import {
    retrieveUser, registerUser, authenticateUser, createGame,
    deleteGame, joinGame, retrieveGame, addPlayerHand,
    retrieveRandomCards, updateUserCards
} from '../../logic'


console.log('LLLLLL', authenticateUser)


export default withRouter(function ({ history }) {
    const [user, setUser] = useState()
    const [feed, setFeed] = useState()

    const [join, setViewJoinPanel] = useState(false)
    const [wait, setViewWaitPartnerPanel] = useState(false)
    const [hand, setViewSelectHandPanel] = useState(false)

    useEffect(() => {

        const { token } = sessionStorage;

        (async () => {
            if (token) {
                try {
                    const user = await retrieveUser(token)
                    setUser(user)
                    if (user.cards.length === 0) {
                        const randomCards = await retrieveRandomCards(9)

                        await updateUserCards(token, randomCards)

                        setFeed({ title: "💬 Welcome to Baam", message: "Your first cards collection is waiting you!" })
                    }
                } catch ({ message }) {
                    setFeed({ title: "🦖 There was an error:", message })
                }
            }
        })()
    }, [sessionStorage.token])

    useEffect(() => {
        const { gameId } = sessionStorage;
        (async () => {
            if (gameId) {
                try {
                    const game = await retrieveGame(gameId, token)
                    const user = await retrieveUser(token)
                    const currentPlayer = game.players.findIndex (player => player.user.id === user.id)
                } catch ({ message }) {
                    setFeed({ title: "🦖 There was an error:", message })
                }
            }
        })()
    }, [sessionStorage.gameId])

    ////***********  NAVIGATION HANDLERS 
    function handleGoToLanding() { history.push('/') }
    function handleGoToRegister() { history.push('/register') }
    function handleGoGetNewCards() { history.push('/newcards') }
    function handleGoShowCards() { history.push('/cards') }
    function handleGoStartGame() { history.push('/newgame') }
    function handleGoToJoinGame() { setViewJoinPanel(true) }


    function handleCloseError() { setFeed(undefined) }
    function handleCloseJoinWindow() { setViewJoinPanel(!join) }

    async function handleRegister(name, surname, email, username, password) {
        try {

            await registerUser(name, surname, email, username, password)

            setFeed({ title: "🕶 Weeell done!!", message: "Registered Succesfully. Proceed to Login!" })

            history.push('/')
        } catch ({ message }) {
            setFeed({ title: "🦖 There was an error:", message })
        }
    }

    async function handleLogin(nickname, password) {
        try {
            const token = await authenticateUser(nickname, password)
            sessionStorage.token = token

            history.push('/home')
        }
        catch (error) {
            console.error(error)
            setFeed({ title: "🦖 There was an error:", message: error.message })
        }
    }

    function handleLogout() {
        sessionStorage.clear()
        history.push('/')
    }

    async function handleGoToCreateGame() {
        try {
            const { token } = sessionStorage
            const { gameId, playerId } = await createGame(token)

            sessionStorage.gameId = gameId
            setViewSelectHandPanel(!hand)
        }
        catch ({ message }) {
            setFeed({ title: "🦖 There was an error:", message })
        }
    }

    async function handleCloseWaiting(gameId) {
        try {
            const { token } = sessionStorage
            const game = await retrieveGame(gameId, token)
            if (game.status === 'PENDING')
                await deleteGame(gameId, token)

            delete sessionStorage.gameId

            setViewWaitPartnerPanel(false)

        } catch ({ message }) {
            setFeed({ title: "🦖 There was an error:", message })
        }
    }

    function handleGoToGame(gameId) {
        setViewWaitPartnerPanel(false)
        setViewSelectHandPanel(false)
        setViewJoinPanel(false)
        
        history.push(`/board-game/${gameId}`)
    }

    async function handleJoinGame(gameId) {
        try {
            const { token } = sessionStorage
            await joinGame(token, gameId)
            sessionStorage.gameId = gameId
            setViewSelectHandPanel(true)
        } catch ({ message }) {
            setFeed({ title: "🦖 There was an error:", message })
        }
    }

    async function handleSelectHand(gameId, hand) {
        try {
            const { token } = sessionStorage
            await addPlayerHand(gameId, token, hand)
            setViewSelectHandPanel(false)
            if (join) {
                setViewJoinPanel(false)
                handleGoToGame(gameId)
            } else setViewWaitPartnerPanel(true)
        } catch ({ message }) {
            setFeed({ title: "🦖 There was an error:", message })
        }
    }

    const { token, gameId } = sessionStorage

    return <>
        <Context.Provider value={{ feed, setFeed }}>
            <Route exact path="/" render={() => token ? <Redirect to="/home" /> : <Landing onGoToRegister={handleGoToRegister} onLogin={handleLogin} />} />
            <Route path="/register" render={() => token ? <Redirect to="/home" /> : <Register onBack={handleGoToLanding} onRegister={handleRegister} />} />
            <Route path="/home" render={() => token ?
                <Home user={user} onLogout={handleLogout} onShowCards={handleGoShowCards} onGetNewCards={handleGoGetNewCards} onStartGame={handleGoStartGame}/>
                :
                <Redirect to="/" />} />
            <Route path="/cards" render={() => token ? <YourCards user={user} onLogout={handleLogout} onGetNewCards={handleGoGetNewCards} onHome={handleGoToLanding} /> : <Redirect to="/" />} />
            <Route path="/newcards" render={() => token ? <NewCards onLogout={handleLogout} onHome={handleGoToLanding} history={history}/> : <Redirect to="/" />} />
            <Route path="/newgame" render={() => token ? <Game user={user} onLogout={handleLogout} onCreate={handleGoToCreateGame} onJoin={handleGoToJoinGame} onHome={handleGoToLanding} /> : <Redirect to="/" />} />
            {join && token && <JoinGame onJoin={handleJoinGame} onClose={handleCloseJoinWindow} />}
            {hand && <SelectHand user={user} onSelect={handleSelectHand} game={gameId} />}
            {wait && token && <WaitPartner onChangeStatus={handleGoToGame} gameId={gameId} onClose={handleCloseWaiting} history={history} />}
            <Route path="/board-game/:gameId" render={() => token ? <GameBoard history={history} /> : <Redirect to="/home" />} />
            {feed && <Feedback title={feed.title} message={feed.message} onClose={handleCloseError} />}
        </Context.Provider>
    </>
})