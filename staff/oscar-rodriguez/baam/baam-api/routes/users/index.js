require('dotenv').config()
const { Router } = require('express')
const jwt = require('jsonwebtoken')
const { env: { SECRET } } = process
const bodyParser = require('body-parser')
const jsonBodyParser = bodyParser.json()
const tokenVerifier = require('../../helpers/token-verifier')(SECRET)
const { registerUser, authenticateUser, retrieveUser, updateUserCards } = require('../../logic')
const { errors: { ConflictError, NotFoundError, CredentialsError } } = require('baam-util')

const router = Router()

router.post('/', jsonBodyParser, (req, res) => {
    const { body: { name, surname, email, nickname, password } } = req

    try {
        registerUser(name, surname, email, nickname, password)
            .then(() => res.status(201).end())
            .catch(error => {
                const { message } = error

                if (error instanceof ConflictError)
                    return res.status(409).json({ message })
                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }

})

router.post('/auth', jsonBodyParser, (req, res) => {
    const { body: { nickname, password } } = req

    try {
        authenticateUser(nickname, password)
            .then(id => {
                const token = jwt.sign({ sub: id }, SECRET, { expiresIn: '1d' })
                res.json({ token })
            })
            .catch(error => {
                const { message } = error

                if (error instanceof CredentialsError)
                    return res.status(401).json({ message })

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.get('/', tokenVerifier, (req, res) => {
    try {
        const { id } = req

        retrieveUser(id)
            .then(user => res.json( user ))
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

router.patch('/cards', tokenVerifier, jsonBodyParser, (req,res) => {
    try {
        const { id, body : { cards } } = req

        updateUserCards(id, cards)
            .then(() => res.end())
            .catch((error => {
                const { message } = error
                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })
                res.status(500).json({ message })
            }))

    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

module.exports = router