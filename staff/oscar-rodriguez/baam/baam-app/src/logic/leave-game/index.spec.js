const { random, floor } = Math
const leaveGame = require('.')
const { errors: { NotFoundError, ContentError, ConflictError } } = require('baam-util')
const { ObjectId, database, models: { User, Game , Player} } = require('baam-data')
const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const TEST_SECRET = process.env.REACT_APP_TEST_SECRET
const jwt = require('jsonwebtoken')

describe('logic - leave game', () => {

    beforeAll(() => database.connect(TEST_DB_URL))

    let gameId, user1Id, user2Id, token1, token2

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
        token1 = jwt.sign({sub: user1.id}, TEST_SECRET)
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
        token2 = jwt.sign({sub: user2.id}, TEST_SECRET)
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
        await leaveGame(gameId, token1)

        let game = await Game.findById(gameId).lean()
        expect(game).toBeDefined()
        expect(game.currentPlayer).toBe(1)
        expect(game.status).toBe('END')
        expect(game.winner).toBe(1)

    })

    it('should fail on leave game when userId is not in the game', async () => {
        const wrong = ObjectId().toString()

        const badtoken = jwt.sign({sub:wrong}, TEST_SECRET)
        try {
            await leaveGame(gameId, badtoken)
            throw Error('should not reach this poing')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe(`you are not in the game you want to leave`)
        }
    })

    it('should fail on wrong game id', async () => {
        const wrong = ObjectId().toString()

        try {
            
            await leaveGame(wrong, token1)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`game with id ${wrong} not found`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => leaveGame(1)).toThrow(TypeError, '1 is not a string')
        expect(() => leaveGame(true)).toThrow(TypeError, 'true is not a string')
        expect(() => leaveGame([])).toThrow(TypeError, ' is not a string')
        expect(() => leaveGame({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => leaveGame(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => leaveGame(null)).toThrow(TypeError, 'null is not a string')

        expect(() => leaveGame('')).toThrow(ContentError, 'gameId is empty or blank')
        expect(() => leaveGame(' \t\r')).toThrow(ContentError, 'gameId is empty or blank')

        expect(() => leaveGame(gameId, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => leaveGame(gameId, true)).toThrow(TypeError, 'true is not a string')
        expect(() => leaveGame(gameId, [])).toThrow(TypeError, ' is not a string')
        expect(() => leaveGame(gameId, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => leaveGame(gameId, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => leaveGame(gameId, null)).toThrow(TypeError, 'null is not a string')

        expect(() => leaveGame(gameId, '')).toThrow(ContentError, 'playerId is empty or blank')
        expect(() => leaveGame(gameId, ' \t\r')).toThrow(ContentError, 'playerId is empty or blank')
    })
    afterAll(() => Promise.all([Player.deleteMany(), User.deleteMany(), Game.deleteMany()]).then(database.disconnect))
})