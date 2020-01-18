const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const TEST_SECRET = process.env.REACT_APP_TEST_SECRET
const { ObjectId, database, models: { User, Game, Player } } = require('baam-data')
const { errors: { ContentError, NotFoundError } } = require('baam-util')
const { random } = Math
const createGame = require('.')
const jwt = require('jsonwebtoken')

describe('logic - create game', () => {

    beforeAll(() => database.connect(TEST_DB_URL))

    let id, token

    beforeEach(async () => {
        await Promise.all([Game.deleteMany(), Player.deleteMany()])
        let name = `name-${random()}`
        let surname = `surname-${random()}`
        let email = `email-${random()}@mail.com`
        let nickname = `nickname-${random()}`
        let password = `password-${random()}`

        const user = await User.create({ name, surname, email, nickname, password })

        id = user.id

        token = jwt.sign({ sub: id }, TEST_SECRET)
    })


    it('should create a new game with the first player', async () => {

        const { gameId, playerId } = await createGame(token)

        const game = await Game.findById(gameId)
        expect(game).toBeDefined()
        expect(game.players).toBeInstanceOf(Array)
        expect(game.players.length).toBe(1)
        expect(typeof game.currentPlayer).toBe('number')
        expect([0, 1]).toContain(game.currentPlayer)

        expect(game.players[0].user.toString()).toBe(id)

        expect(playerId).toBe(game.players[0].id)

    })

    it('should fail on a unexisting userID', async () => {
        id = ObjectId().toString()

        token = jwt.sign({ sub: id }, TEST_SECRET)

        try {
            await createGame(token)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user not found`)
        }

    })

    it('should fail on incorrect type and content', () => {
        expect(() => createGame(1)).toThrow(TypeError, '1 is not a string')
        expect(() => createGame(true)).toThrow(TypeError, 'true is not a string')
        expect(() => createGame([])).toThrow(TypeError, ' is not a string')
        expect(() => createGame({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => createGame(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => createGame(null)).toThrow(TypeError, 'null is not a string')

        expect(() => createGame('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => createGame(' \t\r')).toThrow(ContentError, 'id is empty or blank')
    })

    afterAll(() => Promise.all([Game.deleteMany(), Player.deleteMany()])
        .then(database.disconnect))
})