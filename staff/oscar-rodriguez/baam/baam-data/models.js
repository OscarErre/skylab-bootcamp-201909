const { model } = require ('mongoose')
const { user, card, collection, game, shoot, player } = require ('./schemas')

module.exports = {
    User: model ('User', user),
    Card: model ('Card', card),
    Game: model ('Game', game),
    Collection: model ('Collection', collection),
    Player: model ('Player', player),
    Shoot: model ('Shoot', shoot)
}