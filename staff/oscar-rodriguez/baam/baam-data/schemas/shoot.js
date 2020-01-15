const {Schema, ObjectId} = require ('mongoose')
module.exports = new Schema ({
    user: {
        type: ObjectId,
        ref: 'User'
    },
    card: {
        type: ObjectId,
        ref: 'Card'
    },
    date: Date
})