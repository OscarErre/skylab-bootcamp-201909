require('dotenv').config()
const { Router } = require('express')
const jwt = require('jsonwebtoken')
const { env: { SECRET } } = process
const bodyParser = require('body-parser')
const jsonBodyParser = bodyParser.json()
const tokenVerifier = require('../../helpers/token-verifier')(SECRET)
const { retrieveCard, retrieveCollectionCards, retrieveUserCards, retrieveRandomCards } = require('../../logic')
const { errors: { NotFoundError, ContentError, ConflictError } } = require('baam-util')

const router = Router()

router.get('/:idCard', (req, res) => {
    try {
        const { params: { idCard : cardId} } = req

        retrieveCard(cardId)
            .then(card => res.json(card))
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

router.get('/random/:size', (req,res) => {
    try {
        const { params: { size } } = req

        retrieveRandomCards(parseInt(size))
            .then (cards => {
                res.json(cards)
            })
            .catch(error => {
                const {message} = error
                if (error instanceof NotFoundError)
                    res.status(404).json({message})
                res.status(500).json({message})
            })
    } catch ({message}) {
        res.status(400).json({message})
    }
})

router.get('/collections/:idCollection', (req, res) => {
    try {
        const { params: { idCollection } } = req
        retrieveCollectionCards(idCollection)
            .then(cards => res.json(cards))
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

router.get('/', tokenVerifier, (req, res) => {
    try {
        const { id: userId } = req
        retrieveUserCards(userId)
            .then(cards => res.json(cards))
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

module.exports = router