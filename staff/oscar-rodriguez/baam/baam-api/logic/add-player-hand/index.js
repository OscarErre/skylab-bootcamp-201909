const { validate, errors: { NotFoundError, ContentError, ConflictError } } = require('baam-util')
const { ObjectId, models: { User , Game} } = require('baam-data')
require('dotenv').config()
const { env: { HAND_LENGTH } } = process

module.exports = function (gameId, userId, hand) {
    validate.string(gameId)
    validate.string.notVoid('id', gameId)
    if (!ObjectId.isValid(gameId)) throw new ContentError(`${gameId} is not a valid id`)
    gameId = ObjectId(gameId)

    validate.string(userId)
    validate.string.notVoid('id', userId)
    if (!ObjectId.isValid(userId)) throw new ContentError(`${userId} is not a valid id`)
    userId = ObjectId(userId)

    validate.array(hand)
    if (hand.length != HAND_LENGTH) throw new ConflictError(`hand must have ${HAND_LENGTH} cards to play`)
    
    const objectIdsHand = hand.map(card=>{
        if (!ObjectId.isValid(card)) throw new ConflictError(`hand must have ${HAND_LENGTH} cards to play`)
        return ObjectId(card)
    })

    return (async () => {
        //get the specified game
        const game = await Game.findById(gameId)
        if (!game) throw new NotFoundError(`game with id ${gameId} not found`)

        //get the numberPlayer, if the player is not in the game, throw an error
        const players = game.players.toObject()
        const currentPlayer = players.findIndex(({user}) => user.toString() === userId.toString())
        if (currentPlayer < 0) throw new NotFoundError(`${userId} is not joined to game ${gameId}`)

        //check that hand cards pertains to the player
        const user = await User.findById(players[currentPlayer].user)
        if(!objectIdsHand.every(card => user.cards.indexOf(card) >= 0)) throw new ConflictError(`one or more cards doesn't pertain to player`)

        game.players[currentPlayer].hand = hand.slice()

        await game.save()
    })()
}