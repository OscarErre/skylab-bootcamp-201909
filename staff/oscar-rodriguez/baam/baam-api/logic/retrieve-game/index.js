const { validate, errors: { NotFoundError, ContentError, ConflictError } } = require('baam-util')
const { ObjectId, models: { Game, User } } = require('baam-data')

module.exports = function (gameId, userId) {
    validate.string(gameId)
    validate.string.notVoid('gameId', gameId)
    if (!ObjectId.isValid(gameId)) throw new ContentError(`${gameId} is not a valid id`)

    validate.string(userId)
    validate.string.notVoid('playerId', userId)
    if (!ObjectId.isValid(userId)) throw new ContentError(`${userId} is not a valid id`)

    return (async () => {
        const game = await Game.findById(gameId, { '__v': 0 })
                                        .populate('shoots.card')
                                        .populate('shoots.user', 'id nickname')
                                        .populate('players.user', 'nickname')
                                        .populate('players.hand')
                                        .populate('players.tempZone.card')
                                        .populate('players.discards')
                                        
        if (!game) throw new NotFoundError(`game with id ${gameId} not found`)
        if (!game.players.find(player => player.user.id.toString() === userId.toString())) throw new ConflictError(`${userId} can't get info from a game where is not joined`)
        
        let index = game.players.findIndex(player => player.user.id.toString() === userId.toString())
        game.players[index].lastAccess = new Date ()
        
        game.save()

        const _game = game.toObject()

        _game.players.forEach(async player => {
            
            const { hand, tempZone, discards } = player

            player.id = player._id.toString()
            delete player._id

            if (tempZone.card) {
                player.tempZone.card.id = player.tempZone.card._id.toString()
                delete player.tempZone.card._id
            }

            discards.forEach(card => {
                card.id = card._id.toString()
                delete card._id
            })

            if (player.user._id.toString() === userId.toString()) {
                hand.forEach(card => {
                    card.id = card._id.toString()
                    delete card._id
                })
                
                
                player.user.id = player.user._id.toString()
                delete player.user._id
            } else {
                player.hand = player.hand.fill(undefined)
                player.discards = player.discards.fill(undefined)
                delete player.user._id
            }   
        })
        _game.id = _game._id.toString()
        delete _game._id

        return _game
    })()
}