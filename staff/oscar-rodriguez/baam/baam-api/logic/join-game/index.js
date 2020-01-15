const { validate, errors: { ContentError, NotFoundError, ConflictError } } = require('baam-util')
const { ObjectId, models: { User, Player, Game } } = require('baam-data')
require('dotenv').config()
const { env: { INITIAL_PLAYER_LIFE } } = process

module.exports = function (userId, gameId) {
    validate.string(userId)
    validate.string.notVoid('id', userId)
    if (!ObjectId.isValid(userId)) throw new ContentError(`${userId} is not a valid id`)
    userId = ObjectId(userId)

    validate.string(gameId)
    validate.string.notVoid('id', gameId)
    if (!ObjectId.isValid(gameId)) throw new ContentError(`${gameId} is not a valid id`)
    gameId = ObjectId(gameId)

    return (async () => {

        const user = await User.findById(userId)
        if (!user) throw new NotFoundError('user not found')

        const game = await Game.findById(gameId)
        if (!game) throw new NotFoundError('game not found')

        const [firstPlayer] = game.players
        if (firstPlayer.user.toString() === userId.toString()) throw new ConflictError("can't join same user 2 times")
        
        const newPlayer = new Player({
            user: user._id,
            lifePoints: parseInt(INITIAL_PLAYER_LIFE),
            hand: [],
            tempZone: null,
            discards: [],
            modifier: false,
            attack: 1,
            defense: 0,
            lastAccess: new Date
        })

        game.players.push(newPlayer)
        game.status = 'READY'
        await game.save()

        return newPlayer.id
    })()
}