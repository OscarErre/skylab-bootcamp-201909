const {Schema, ObjectId} = require ('mongoose')

module.exports = new Schema ({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    col: {
        type: ObjectId,
        ref: 'Collection',
        required: true
    },
    //ATTACK, DEFEND, HEAL, BLOCK
    effect: {
        type: String,
        required: true
    },
    //Value of attack, defende, heal, or duration of Block
    effectValue: {
        type: Number,
        required: true
    },
    //For future: On sabotaje type, the target of him (lifePoints, hand, turns... etc)
    target: {
        type: String,
        required: true
    }
})