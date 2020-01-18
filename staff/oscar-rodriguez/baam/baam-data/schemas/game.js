const {Schema} = require ('mongoose')
const player = require('./player')
const shoot = require('./shoot')

module.exports = new Schema ({
    players: [player],
    shoots: [shoot],
    currentPlayer: Number,
    status: String,
    winner: Number
})