require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const chai = require('chai')
const { expect } = chai
const { random, floor } = Math
const leaveGame = require('.')
const { errors: { NotFoundError, ContentError, ConflictError } } = require('baam-util')
const { ObjectId, database, models: { User, Game , Player} } = require('baam-data')

describe('logic - leave game', () => {

    before(() => database.connect(TEST_DB_URL))

    let gameId, user1Id, user2Id

    beforeEach(async () => {
        await Promise.all([Game.deleteMany(), Player.deleteMany(), User.deleteMany()])

        let name = `name-${random()}`
        let surname = `surname-${random()}`
        let email = `email-${random()}@mail.com`
        let nickname = `nickname-${random()}`
        let password = `password-${random()}`
        let stats = {
            wins: random(),
            loses: random(),
            ties: random()
        }

        const user1 = await User.create({ name, surname, email, nickname, password, stats})
        user1Id = user1.id

        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        nickname = `nickname-${random()}`
        password = `password-${random()}`
        stats = {
            wins: random(),
            loses: random(),
            ties: random()
        }
        const user2 = await User.create({ name, surname, email, nickname, password, stats})
        user2Id = user2.id

        const newPlayer1 = new Player({
            user: user1Id,
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
            user: user2Id,
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
            players: [newPlayer1, newPlayer2],
            shots: [],
            currentPlayer: floor(random() * 2),
            status: 'PENDING'
        }


        const game = await Game.create(newGame)
        gameId = game.id

    })

    it('should let user1 leave game, set game to END, and make user2 winner', async () => {
        await leaveGame(gameId, user1Id)

        let game = await Game.findById(gameId).lean()
        expect(game).to.exist
        expect(game.currentPlayer).to.equal(1)
        expect(game.status).to.equal('END')
        expect(game.winner).to.equal(1)

    })

    it('should fail on leave game when userId is not in the game', async () => {
        const wrong = ObjectId().toString()

        try {
            await leaveGame(gameId, wrong)
            throw Error('should not reach this poing')
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal(`you are not in the game you want to leave`)
        }
    })

    it('should fail on wrong game id', async () => {
        const wrong = '012345678901234567890123'

        try {
            await leaveGame(wrong, user1Id)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`game with id ${wrong} not found`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => leaveGame(1)).to.throw(TypeError, '1 is not a string')
        expect(() => leaveGame(true)).to.throw(TypeError, 'true is not a string')
        expect(() => leaveGame([])).to.throw(TypeError, ' is not a string')
        expect(() => leaveGame({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => leaveGame(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => leaveGame(null)).to.throw(TypeError, 'null is not a string')
        expect(() => leaveGame('wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => leaveGame('')).to.throw(ContentError, 'gameId is empty or blank')
        expect(() => leaveGame(' \t\r')).to.throw(ContentError, 'gameId is empty or blank')

        expect(() => leaveGame(gameId, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => leaveGame(gameId, true)).to.throw(TypeError, 'true is not a string')
        expect(() => leaveGame(gameId, [])).to.throw(TypeError, ' is not a string')
        expect(() => leaveGame(gameId, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => leaveGame(gameId, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => leaveGame(gameId, null)).to.throw(TypeError, 'null is not a string')
        expect(() => leaveGame(gameId, 'wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => leaveGame(gameId, '')).to.throw(ContentError, 'playerId is empty or blank')
        expect(() => leaveGame(gameId, ' \t\r')).to.throw(ContentError, 'playerId is empty or blank')
    })
    after(() => Promise.all([Player.deleteMany(), User.deleteMany(), Game.deleteMany()]).then(database.disconnect))
})