const { validate, errors: { NotFoundError, ContentError, ConflictError } } = require('baam-util')
const { ObjectId, models: { Game } } = require('baam-data')

module.exports = function (gameId, userId) {
    validate.string(gameId)
    validate.string.notVoid('gameId', gameId)
    if (!ObjectId.isValid(gameId)) throw new ContentError(`${gameId} is not a valid id`)
    gameId = ObjectId(gameId)

    validate.string(userId)
    validate.string.notVoid('playerId', userId)
    if (!ObjectId.isValid(userId)) throw new ContentError(`${userId} is not a valid id`)

    return (async () => {
        const game = await Game.findById(gameId, { '__v': 0 })
        if (!game) throw new NotFoundError(`game with id ${gameId} not found`)

        if (game.players[0].user.toString() != userId) throw new ConflictError (`you can't delete a game you didn't create`)
        if (game.status != 'PENDING') throw new ConflictError (`you can't delete an started or ended game`)

        await game.deleteOne(gameId)

        return
    })()
}