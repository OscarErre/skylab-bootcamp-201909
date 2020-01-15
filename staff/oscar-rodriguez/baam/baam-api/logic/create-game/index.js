const { validate, errors: { ContentError, NotFoundError } } = require('baam-util')
const { ObjectId, models: { User, Player, Game } } = require('baam-data')
const { random, floor } = Math
require('dotenv').config()
const { env: { INITIAL_PLAYER_LIFE } } = process

module.exports = function (userId) {
    validate.string(userId)
    validate.string.notVoid('id', userId)

    if (!ObjectId.isValid(userId)) throw new ContentError(`${userId} is not a valid id`)

    userId = ObjectId(userId)

    return (async () => {

        const user = await User.findById(userId)
        if (!user) throw new NotFoundError('user not found')

        const newPlayer = new Player ({
            user: user._id,
            lifePoints: parseInt(INITIAL_PLAYER_LIFE),
            hand: [],
            tempZone: null,
            discards: [],
            modifier: false,
            attack: 1,
            defense: 0,
            lastAccess: new Date()
        })

        const newGame = {
            players: [newPlayer],
            shots: [],
            currentPlayer: floor(random() * 2),
            status: 'PENDING'
        }

        const game = await Game.create(newGame)
        return {
            gameId: game.id,
            playerId: newPlayer.id
        }
    })()
}