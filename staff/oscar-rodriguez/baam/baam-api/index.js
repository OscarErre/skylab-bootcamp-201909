require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const { argv: [, , port], env: { PORT = port || 8080, DB_URL, SECRET } } = process
const bodyParser = require('body-parser')
const jsonBodyParser = bodyParser.json()
const tokenVerifier = require('./helpers/token-verifier')(SECRET)
const { name, version } = require('./package.json')
const { registerUser, authenticateUser, retrieveUser, createGame, joinGame, retrieveGame } = require('./logic')
const cors = require('cors')
const { database } = require('baam-data')
const { errors: { ConflictError, NotFoundError, CredentialsError } } = require('../baam-util')

const { users, games, cards } = require ('./routes')

const api = express()

api.use(cors())

api.use('/users', users)
api.use('/games', games)
api.use('/cards', cards)

database
    .connect(DB_URL)
    .then(() => api.listen(PORT, () => console.log(`${name} ${version} up and running on port ${PORT}`)))