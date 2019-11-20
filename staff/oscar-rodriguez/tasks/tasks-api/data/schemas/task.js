const { Schema, ObjectId } = require('mongoose')

module.exports = new Schema ({

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    user: {
        type: ObjectId,
        required: true
    },

    status: {
        type: String,
    },

    date: {
        type: Date
    },

    lastAcces: {
        type: Date,
    }
})