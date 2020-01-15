require('dotenv').config()
const { Router } = require('express')
const jwt = require('jsonwebtoken')
const { env: { SECRET } } = process
const bodyParser = require('body-parser')
const jsonBodyParser = bodyParser.json()
const tokenVerifier = require('../../helpers/token-verifier')(SECRET)
const { createGame, joinGame, retrieveGame, addPlayerHand, playCard, deleteGame, retrievePendingGames, leaveGame, passTurn } = require('../../logic')
const { errors: { ConflictError, NotFoundError, ContentError, CredentialsError, CantAttackError } } = require('baam-util')

const router = Router()

router.get('/pending', (req, res) => {
    try {
        retrievePendingGames()
            .then (games =>{
                res.json(games)
            })
            .catch (error => {
                const {message} = error
                res.status (500).json({message})
            })
    } catch ({message}) {
        res.status(400).json({message})
    }
})

router.post('/create', tokenVerifier, (req, res) => {
    try {
        const { id } = req

        createGame(id)
            .then(({ gameId, playerId }) => {
                res.json({ gameId, playerId })
            })
            .catch(error => {
                const { message } = error
                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })
                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.get('/:gameId/status', tokenVerifier, (req, res) => {
    try {
        const { id: userId, params: { gameId } } = req

        retrieveGame(gameId, userId)
            .then(game => res.json(game))
            .catch(error => {
                const { message } = error
                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })
                if (error instanceof ConflictError)
                    return res.status(401).json({ message })
                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.get('/:gameId/join', tokenVerifier, (req, res) => {
    try {
        const { id: userId, params: { gameId } } = req

        joinGame(userId, gameId)
            .then(playerId => {
                res.json({ playerId })
            })
            .catch(error => {
                const { message } = error
                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })
                if (error instanceof ConflictError)
                    return res.status(400).json({ message })
                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.patch('/:gameId/add-hand', tokenVerifier, jsonBodyParser, (req, res) => {
    try {
        const { id: userId, body: { hand }, params: { gameId } } = req
        addPlayerHand(gameId, userId, hand)
            .then(() => res.end())
            .catch((error => {
                const { message } = error
                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })
                if (error instanceof ConflictError || error instanceof ContentError)
                    return res.status(400).json({ message })
                res.status(500).json({ message })
            }))
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.patch('/:gameId/play-card', tokenVerifier, jsonBodyParser, (req, res) => {
    try {
        const { id: userId, body: { cardId }, params: { gameId } } = req

        playCard(gameId, userId, cardId)
            .then((player) => res.json(player))
            .catch(error => {
                const { message } = error
                if (error instanceof CantAttackError)
                    return res.status(403).json({ message })
                if (error instanceof CredentialsError)
                    return res.status(401).json({ message })
                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })
                if (error instanceof ConflictError || error instanceof ContentError)
                    return res.status(400).json({ message })
                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.delete('/:gameId', tokenVerifier, (req, res) => {
    try {
        const { id, params: { gameId } } = req

        deleteGame(gameId, id)
            .then(() => res.end())
            .catch(error => {
                const { message } = error
                if (error instanceof CredentialsError)
                    return res.status(401).json({ message })
                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })
                if (error instanceof ConflictError)
                    return res.status(403).json({ message })
                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.get('/:gameId/pass', tokenVerifier, (req,res) => {
    try {
        const { id, params: { gameId } } = req
        passTurn(gameId, id)
            .then ((player) => res.json(player))
            .catch(error => {
                const { message } = error
                if (error instanceof CredentialsError)
                    return res.status(401).json({ message })
                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })
            })
    }catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.get('/:gameId/leave', tokenVerifier, (req,res) => {
    try {
        const { id, params: { gameId } } = req
        leaveGame(gameId, id)
            .then ((player) => res.json(player))
            .catch(error => {
                const { message } = error
                if (error instanceof CredentialsError)
                    return res.status(401).json({ message })
                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })
            })
    }catch ({ message }) {
        res.status(400).json({ message })
    }
})

module.exports = router