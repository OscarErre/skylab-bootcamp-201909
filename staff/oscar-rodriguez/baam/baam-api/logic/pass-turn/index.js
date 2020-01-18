const { validate, errors: { NotFoundError, ContentError, CredentialsError } } = require('baam-util')
const { ObjectId, models: { Game, User } } = require('baam-data')

module.exports = function (gameId, userId) {

    validate.string(gameId)
    validate.string.notVoid('id', gameId)
    if (!ObjectId.isValid(gameId)) throw new ContentError(`${gameId} is not a valid id`)
    gameId = ObjectId(gameId)

    validate.string(userId)
    validate.string.notVoid('id', userId)
    if (!ObjectId.isValid(userId)) throw new ContentError(`${userId} is not a valid id`)
    userId = ObjectId(userId)

    return (async () => {
        const game = await Game.findById(gameId)
        if (!game) throw new NotFoundError(`game with id ${gameId} not found`)

        const { currentPlayer } = game

        if (userId.toString() !== game.players[currentPlayer].user.toString())
            throw new CredentialsError(`Is not the ${userId} turn. Can't play the card`)
        
        game.players[currentPlayer].lifePoints--

        if (game.players[currentPlayer].lifePoints <= 0) {

            const enemy = (game.currentPlayer + 1) % 2
            game.winner = enemy
            game.status = 'END'

            let user1 = await User.findById(game.players[currentPlayer].user)
            let user2 = await User.findById(game.players[enemy].user)

            user1.stats.loses++
            user2.stats.wins++

            await user1.save()
            await user2.save()
        } 

        game.currentPlayer = (game.currentPlayer + 1) % 2

        await game.save()
        return game.currentPlayer
    })()
}