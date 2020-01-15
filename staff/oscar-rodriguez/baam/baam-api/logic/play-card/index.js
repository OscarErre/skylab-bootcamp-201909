const { validate, errors: { NotFoundError, ContentError, ConflictError, CantAttackError, CredentialsError } } = require('baam-util')
const { ObjectId, models: { Card, Game, Shoot, User } } = require('baam-data')

module.exports = function (gameId, userId, cardId) {

    validate.string(gameId)
    validate.string.notVoid('id', gameId)
    if (!ObjectId.isValid(gameId)) throw new ContentError(`${gameId} is not a valid id`)
    gameId = ObjectId(gameId)

    validate.string(userId)
    validate.string.notVoid('id', userId)
    if (!ObjectId.isValid(userId)) throw new ContentError(`${userId} is not a valid id`)
    userId = ObjectId(userId)

    validate.string(cardId)
    validate.string.notVoid('id', cardId)
    if (!ObjectId.isValid(cardId)) throw new ContentError(`${cardId} is not a valid id`)
    cardId = ObjectId(cardId)


    async function updateStats(player1, player2, stats, coins) {
        let user1 = await User.findById(player1)
        let user2 = await User.findById(player2)

        user1.stats[stats[0]]++
        user2.stats[stats[1]]++

        user1.coins += coins[0]
        user2.coins += coins[1]

        await user1.save()
        await user2.save()

        return
    }

    return (async () => {

        const game = await Game.findById(gameId)
        if (!game) throw new NotFoundError(`game with id ${gameId} not found`)

        const { currentPlayer } = game
        const enemy = (currentPlayer + 1) % 2

        if (userId.toString() !== game.players[currentPlayer].user.toString())
            throw new CredentialsError(`Is not the ${userId} turn. Can't play the card`)

        const handIndex = game.players[currentPlayer].hand.findIndex(({ _id }) => _id.toString() === cardId.toString())
        if (handIndex < 0) throw new ConflictError(`${userId} doesn't own the card ${cardId} on his hand`)

        const card = await Card.findById(cardId).lean()
        if (!card) throw new NotFoundError(`card with id ${cardId} not found`)

        const { effectValue, effect } = card

        if (effect != "BLOCK") {
            const shoot = new Shoot({ user: userId, card: cardId, date: new Date })
            game.shoots.push(shoot)
        }
        
        game.players[currentPlayer].hand.splice(handIndex, 1)

        switch (effect) {
            case 'DEFEND':
                game.players[currentPlayer].defense += effectValue
                break
            case 'HEAL':
                game.players[currentPlayer].lifePoints += effectValue
                break
            case 'BLOCK':
                if (game.players[currentPlayer].tempZone.duration >= 0) game.players[currentPlayer].discards.push(game.players[currentPlayer].tempZone.card)
                game.players[currentPlayer].tempZone.card = cardId
                game.players[currentPlayer].tempZone.duration = effectValue
                game.players[enemy].attack = 0
                break
            case 'ATTACK':
                if (!game.players[currentPlayer].attack) throw new CantAttackError(`you are blocked and can't attack`)
                const attackPoints = (effectValue - game.players[enemy].defense)
                if (attackPoints > 0)
                    game.players[enemy].lifePoints -= attackPoints
                else game.players[enemy].defense -= effectValue

                if (!game.players[enemy].lifePoints) {
                    game.status = 'END'
                    game.winner = currentPlayer 
                    await updateStats(game.players[currentPlayer].user, game.players[enemy].user, ["wins", "loses"], [game.players[currentPlayer].lifePoints*5, -5])
                    await game.save()
                    return game.currentPlayer
                }
                break
            default: throw new Error(`WTF?! can't recognize the card effect`)
            // 'DISCARD', 'TIEF', 'SHOW', 'RECOVER' could be more programable accions to do
        }

        const { duration } = game.players[currentPlayer].tempZone

        if (duration > 0 && effect != 'BLOCK') {
            game.players[currentPlayer].tempZone.duration--
            if (!game.players[currentPlayer].tempZone.duration) {
                game.players[currentPlayer].discards.push(game.players[currentPlayer].tempZone.card)
                game.players[currentPlayer].tempZone.card = null
                game.players[currentPlayer].tempZone.duration = -1
                game.players[enemy].attack = 1
            }
        }

        //END OF TURN
        if (!game.players[currentPlayer].hand.length) {
            game.status = 'END'
            if (game.players[currentPlayer].lifePoints > game.players[enemy].lifePoints) {
                game.winner = currentPlayer
                await updateStats(game.players[currentPlayer].user, game.players[enemy].user, ["wins", "loses"], [game.players[currentPlayer].lifePoints*10, -5])
            }
            else if (game.players[currentPlayer].lifePoints < game.players[enemy].lifePoints) {
                        game.winner = enemy
                        await updateStats(game.players[currentPlayer].user, game.players[enemy].user, ["loses", "wins"], [-5, game.players[currentPlayer].lifePoints*10])
            }
            else {
                game.winner = -1
                await updateStats(game.players[currentPlayer].user, game.players[enemy].user, ["ties", "ties"], [3,3])
            }
        }
        else
            game.currentPlayer = (game.currentPlayer + 1) % 2

        await game.save()
        return game.currentPlayer
    })()
}