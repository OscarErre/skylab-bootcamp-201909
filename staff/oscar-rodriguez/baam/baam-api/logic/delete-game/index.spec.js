require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const chai = require('chai')
const { expect } = chai
const chaiSubset = require('chai-subset')
chai.use(chaiSubset)
const { random, floor } = Math
const deleteGame = require('.')
const { errors: { NotFoundError, ContentError, ConflictError } } = require('baam-util')
const { ObjectId, database, models: { User, Game , Player} } = require('baam-data')

describe('logic - delete game', () => {

    before(() => database.connect(TEST_DB_URL))

    let gameId, game2Id, game3Id, game4Id, userId

    beforeEach(async () => {
        await Promise.all([Game.deleteMany()])

        let name = `name-${random()}`
        let surname = `surname-${random()}`
        let email = `email-${random()}@mail.com`
        let nickname = `nickname-${random()}`
        let password = `password-${random()}`

        const user = await User.create({ name, surname, email, nickname, password })

        userId = user.id

        const newPlayer1 = new Player({
            user: user._id,
            lifePoints: 5,
            hand: [ObjectId().toString(),ObjectId().toString()],
            tempZone: {card: ObjectId().toString(), duration: random()},
            discards: [ObjectId().toString(),ObjectId().toString()],
            modifier: false,
            attack: 1,
            defense: 0,
            lastAccess: new Date()
        })

        const newPlayer2 = new Player({
            user: ObjectId(),
            lifePoints: 5,
            hand: [ObjectId().toString(),ObjectId().toString()],
            tempZone: null,
            discards: [ObjectId().toString(),ObjectId().toString()],
            modifier: false,
            attack: 1,
            defense: 0,
            lastAccess: new Date()
        })

        const newGame = {
            players: [newPlayer1],
            shots: [],
            currentPlayer: floor(random() * 2),
            status: 'PENDING'
        }

        const newGame2 = {
            players: [newPlayer2],
            shots: [],
            currentPlayer: floor(random() * 2),
            status: 'PENDING'
        }

        const newGame3 = {
            players: [newPlayer1, newPlayer2],
            shots: [],
            currentPlayer: floor(random() * 2),
            status: 'END'
        }

        const newGame4 = {
            players: [newPlayer1, newPlayer2],
            shots: [],
            currentPlayer: floor(random() * 2),
            status: 'READY'
        }

        const games = await Game.create([newGame,newGame2,newGame3,newGame4])
        gameId = games[0].id
        game2Id = games[1].id
        game3Id = games[2].id
        game4Id = games[3].id

    })

    it('should delete the game if status PENDING and userId is the game creator', async () => {
        await deleteGame(gameId, userId)

        let game = await Game.findById(gameId).lean()
        expect(game).to.not.exist

        game = await Game.findById(game2Id).lean()
        expect(game).to.exist

        game = await Game.findById(game3Id).lean()
        expect(game).to.exist

        game = await Game.findById(game4Id).lean()
        expect(game).to.exist
    })

    it('should fail on delete game when userId is NOT the game creator', async () => {
        const wrong = ObjectId().toString()

        try {
            await deleteGame(gameId, wrong)
            throw Error('should not reach this poing')
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal(`you can't delete a game you didn't create`)
        }
    })

    it('should fail on wrong game id', async () => {
        const wrong = '012345678901234567890123'

        try {
            await deleteGame(wrong, userId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`game with id ${wrong} not found`)
        }
    })

    it('should fail on a not PENDING game', async () => {

        try {
            await deleteGame(game3Id, userId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ConflictError)
            expect(error.message).to.equal(`you can't delete an started or ended game`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => deleteGame(1)).to.throw(TypeError, '1 is not a string')
        expect(() => deleteGame(true)).to.throw(TypeError, 'true is not a string')
        expect(() => deleteGame([])).to.throw(TypeError, ' is not a string')
        expect(() => deleteGame({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => deleteGame(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => deleteGame(null)).to.throw(TypeError, 'null is not a string')
        expect(() => deleteGame('wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => deleteGame('')).to.throw(ContentError, 'gameId is empty or blank')
        expect(() => deleteGame(' \t\r')).to.throw(ContentError, 'gameId is empty or blank')

        expect(() => deleteGame(gameId, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => deleteGame(gameId, true)).to.throw(TypeError, 'true is not a string')
        expect(() => deleteGame(gameId, [])).to.throw(TypeError, ' is not a string')
        expect(() => deleteGame(gameId, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => deleteGame(gameId, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => deleteGame(gameId, null)).to.throw(TypeError, 'null is not a string')
        expect(() => deleteGame(gameId, 'wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => deleteGame(gameId, '')).to.throw(ContentError, 'playerId is empty or blank')
        expect(() => deleteGame(gameId, ' \t\r')).to.throw(ContentError, 'playerId is empty or blank')
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(database.disconnect))
})