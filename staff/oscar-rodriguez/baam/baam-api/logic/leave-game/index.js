const { validate, errors: { NotFoundError, ContentError, ConflictError, CredentialsError } } = require('baam-util')
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

        let currentPlayer = game.players.findIndex(player => player.user.toString() === userId.toString())
        if (currentPlayer < 0) throw new CredentialsError (`you are not in the game you want to leave`)

        game.status = 'END'
        game.winner = (currentPlayer + 1) % 2
        game.currentPlayer = (currentPlayer + 1) % 2

        await game.save()

        return game.currentPlayer
    })()
}