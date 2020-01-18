const {Schema, ObjectId} = require ('mongoose')

module.exports = new Schema ({
    user: {
        type: ObjectId,
        ref: 'User'
    },
    hand: [{
        type: ObjectId,
        ref: 'Card'}],
    tempZone: {
        card : {
            type: ObjectId,
            ref: 'Card',
        },
        duration: {
            type: Number,
            default: -1
        }
    },
    discards: [{
        type: ObjectId,
        ref: 'Card'}],
    lifePoints: Number,
    modifier: Boolean,
    attack: Number,
    defense: Number,
    lastAccess: Date
})