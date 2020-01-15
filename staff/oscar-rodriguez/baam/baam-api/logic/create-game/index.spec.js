require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const { ObjectId, database, models: { User, Game, Player } } = require('baam-data')
const { errors: {ContentError, NotFoundError}} = require ('baam-util')
const { random } = Math
const createGame = require('.')

describe('logic - create game', () => {

    before(() => database.connect(TEST_DB_URL))

    let id

    beforeEach(async () => {
        await Promise.all([Game.deleteMany(), Player.deleteMany()])
        let name = `name-${random()}`
        let surname = `surname-${random()}`
        let email = `email-${random()}@mail.com`
        let nickname = `nickname-${random()}`
        let password = `password-${random()}`

        const user = await User.create({ name, surname, email, nickname, password })

        id = user._id.toString()
    })


    it('should create a new game with the first player', async () => {

        const {gameId, playerId} = await createGame(id)

        const game = await Game.findById(gameId)
        expect(game).to.exist
        expect(game.players).to.be.an.instanceOf(Array)
        expect(game.players.length).to.equal(1)
        expect(game.currentPlayer).to.be.a('number')
        expect([0, 1]).to.include(game.currentPlayer)
        
        expect(game.players[0].user.toString()).to.equal(id)

        expect(playerId).to.equal(game.players[0].id)

    })

    it('should fail on a unexisting userID', async () => {
        id = ObjectId().toString()

        try {
            await createGame(id)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user not found`)
        }

    })

    it('should fail on incorrect type and content', () => {
        expect(() => createGame(1)).to.throw(TypeError, '1 is not a string')
        expect(() => createGame(true)).to.throw(TypeError, 'true is not a string')
        expect(() => createGame([])).to.throw(TypeError, ' is not a string')
        expect(() => createGame({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => createGame(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => createGame(null)).to.throw(TypeError, 'null is not a string')
        expect(() => createGame('wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => createGame('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => createGame(' \t\r')).to.throw(ContentError, 'id is empty or blank')
    })

    after(() => Promise.all([Game.deleteMany(), Player.deleteMany()])
        .then(database.disconnect))
})