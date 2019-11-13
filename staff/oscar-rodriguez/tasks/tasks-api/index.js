const express = require('express')
const bodyParser = require('body-parser')
const { name, version } = require('./package.json')
const registerUser = require('../tasks-api/logic/register-user')

const api = express()

const jsonBodyParser = bodyParser.json()

const { argv: [, , port = 8080] } = process

api.post('/users', jsonBodyParser, (req, res) => {
    const { body: { name, surname, email, username, password } } = req


    /* registerUser (name, surname, email, username, password)
        .then ((name, surname, email, username, password) => res.json({
            message: `ok, registered :P ${name} ${surname} ${email} ${username} ${password}`
                }))
        .catch ((error=>res.json({
            message: error.message
        }))) */ 
     res.json({
        message: `ok, registered :P ${name} ${surname} ${email} ${username} ${password}`
    })
})

api.listen(port, () => console.log(`${name} ${version} up and running on port ${port}`))