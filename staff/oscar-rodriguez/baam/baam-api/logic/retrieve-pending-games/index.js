const { models: { Game } } = require('baam-data')

module.exports = function () {

    return (async () => {
        const games = await Game.find({'status': 'PENDING'}, { '__v': 0 }).populate('players.user').lean()
        if (games.length === 0) return []

        const gamesPending = []
        games.forEach( game =>{
             gamesPending.push ({
                id: game._id.toString(),
                nickname: game.players[0].user.nickname
            })
        })
        return gamesPending
    })()
}