const { Schema, ObjectId } = require ('mongoose')

module.exports = new Schema ({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    lastAccess: {
        type: Date
    },
    lastReward: {
        type: Date
    },
    daysConnected: {
        type: Number,
        default: 0
    },
    stats: {
        wins: { type: Number, default: 0},
        ties: { type: Number, default: 0},
        loses: { type: Number, default: 0}
    },
    cards: [{
        type: ObjectId,
        ref: 'Card'}],
    coins: {
        type: Number,
        default: 0
    }
})