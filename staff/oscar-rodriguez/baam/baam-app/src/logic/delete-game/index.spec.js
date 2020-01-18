const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const TEST_SECRET = process.env.REACT_APP_TEST_SECRET
const { random, floor } = Math
const deleteGame = require('.')
const { errors: { NotFoundError, ContentError, ConflictError } } = require('baam-util')
const { ObjectId, database, models: { User, Game , Player} } = require('baam-data')
const jwt = require('jsonwebtoken')

describe('logic - delete game', () => {

    beforeAll(() => database.connect(TEST_DB_URL))

    let gameId, game2Id, game3Id, game4Id, userId, token

    beforeEach(async () => {
        await Promise.all([Game.deleteMany()])

        let name = `name-${random()}`
        let surname = `surname-${random()}`
        let email = `email-${random()}@mail.com`
        let nickname = `nickname-${random()}`
        let password = `password-${random()}`

        const user = await User.create({ name, surname, email, nickname, password })

        userId = user.id
        
        token = jwt.sign({sub : userId}, TEST_SECRET)

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
        await deleteGame(gameId, token)

        let game = await Game.findById(gameId).lean()
        expect(game).toBe(null)

        game = await Game.findById(game2Id).lean()
        expect(game).toBeDefined()

        game = await Game.findById(game3Id).lean()
        expect(game).toBeDefined()

        game = await Game.findById(game4Id).lean()
        expect(game).toBeDefined()
    })

    it('should fail on delete game when userId is NOT the game creator', async () => {
        const wrong = ObjectId().toString()

        const badToken = jwt.sign ({sub: wrong}, TEST_SECRET)

        try {
            await deleteGame(gameId, badToken)
            throw Error('should not reach this poing')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe(`you can't delete a game you didn't create`)
        }
    })

    it('should fail on wrong game id', async () => {
        const wrong = '012345678901234567890123'

        try {
            await deleteGame(wrong, token)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`game with id ${wrong} not found`)
        }
    })

    it('should fail on a not PENDING game', async () => {

        try {
            await deleteGame(game3Id, token)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(ConflictError)
            expect(error.message).toBe(`you can't delete an started or ended game`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => deleteGame(1)).toThrow(TypeError, '1 is not a string')
        expect(() => deleteGame(true)).toThrow(TypeError, 'true is not a string')
        expect(() => deleteGame([])).toThrow(TypeError, ' is not a string')
        expect(() => deleteGame({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => deleteGame(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => deleteGame(null)).toThrow(TypeError, 'null is not a string')

        expect(() => deleteGame('')).toThrow(ContentError, 'gameId is empty or blank')
        expect(() => deleteGame(' \t\r')).toThrow(ContentError, 'gameId is empty or blank')

        expect(() => deleteGame(gameId, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => deleteGame(gameId, true)).toThrow(TypeError, 'true is not a string')
        expect(() => deleteGame(gameId, [])).toThrow(TypeError, ' is not a string')
        expect(() => deleteGame(gameId, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => deleteGame(gameId, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => deleteGame(gameId, null)).toThrow(TypeError, 'null is not a string')

        expect(() => deleteGame(gameId, '')).toThrow(ContentError, 'playerId is empty or blank')
        expect(() => deleteGame(gameId, ' \t\r')).toThrow(ContentError, 'playerId is empty or blank')
    })
    afterAll(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(database.disconnect))
})