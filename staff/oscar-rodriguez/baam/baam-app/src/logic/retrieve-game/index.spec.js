const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const TEST_SECRET = process.env.REACT_APP_TEST_SECRET
const { random, floor } = Math
const retrieveGame = require('.')
const { errors: { NotFoundError, ContentError } } = require('baam-util')
const { ObjectId, database, models: { User, Game , Player, Card} } = require('baam-data')
const jwt = require('jsonwebtoken')

describe('logic - retrieve game', () => {

    beforeAll(() => database.connect(TEST_DB_URL))

    let gameId, token, userId, playerId, hand

    beforeEach(async () => {
        await Promise.all([Game.deleteMany(), User.deleteMany(), Player.deleteMany(), Card.deleteMany()])

        hand = []

        for (let i = 0; i < 5; i++) {
            let name = `name-${random()}`
            let description = `description-${random()}`
            let image = `image-${random()}`
            let price = random()
            let col = ObjectId().toString()
            let effect = `effect-${random()}`
            let effectValue = random()
            let target = `target-${random()}`
            
            const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        
            hand.push(card.id)
        }

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
        token = jwt.sign({sub: user1.id}, TEST_SECRET)

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

        const newPlayer1 = new Player({
            user: user1.id,
            lifePoints: 5,
            hand,
            tempZone: {card: hand[0], duration: random()},
            discards: [hand[0],hand[1]],
            modifier: false,
            attack: 1,
            defense: 0,
            lastAccess: new Date()
        })

        playerId = newPlayer1.id
        
        const newPlayer2 = new Player({
            user: user2.id,
            lifePoints: 5,
            hand,
            tempZone: null,
            discards: [hand[0],hand[1]],
            modifier: false,
            attack: 1,
            defense: 0,
            lastAccess: new Date()
        })

        const newGame = {
            players: [newPlayer1, newPlayer2],
            shots: [],
            currentPlayer: floor(random() * 2)
        }

        const game = await Game.create(newGame)
        gameId = game.id

    })

    it('should return the game status on valid userId, which is in the game', async () => {
        const game = await retrieveGame(gameId, token)

        expect(game).toBeDefined()
        expect(game.id).toBe(gameId)
        expect(game.players[0]).toMatchObject({id: playerId})

        expect(game.shoots).toBeInstanceOf(Array)
        expect(typeof game.currentPlayer).toBe('number')
        expect([0,1]).toContain(game.currentPlayer)

    })

    it('should fail on valid playerId, which is NOT in the game', async () => {
        const wrong = ObjectId().toString()

        const badToken = jwt.sign ({sub:wrong}, TEST_SECRET)

        try {
            await retrieveGame(gameId, badToken)
            throw Error('should not reach this poing')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe(`${wrong} can't get info from a game where is not joined`)
        }
    })

    it('should fail on wrong game id', async () => {
        const wrong = '012345678901234567890123'

        try {
            await retrieveGame(wrong, token)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`game with id ${wrong} not found`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => retrieveGame(1)).toThrow(TypeError, '1 is not a string')
        expect(() => retrieveGame(true)).toThrow(TypeError, 'true is not a string')
        expect(() => retrieveGame([])).toThrow(TypeError, ' is not a string')
        expect(() => retrieveGame({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => retrieveGame(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => retrieveGame(null)).toThrow(TypeError, 'null is not a string')
        

        expect(() => retrieveGame('')).toThrow(ContentError, 'gameId is empty or blank')
        expect(() => retrieveGame(' \t\r')).toThrow(ContentError, 'gameId is empty or blank')

        expect(() => retrieveGame(gameId, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => retrieveGame(gameId, true)).toThrow(TypeError, 'true is not a string')
        expect(() => retrieveGame(gameId, [])).toThrow(TypeError, ' is not a string')
        expect(() => retrieveGame(gameId, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => retrieveGame(gameId, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => retrieveGame(gameId, null)).toThrow(TypeError, 'null is not a string')
        

        expect(() => retrieveGame(gameId, '')).toThrow(ContentError, 'playerId is empty or blank')
        expect(() => retrieveGame(gameId, ' \t\r')).toThrow(ContentError, 'playerId is empty or blank')
    })
    afterAll(() => Promise.all([Game.deleteMany(), User.deleteMany(), Player.deleteMany(), Card.deleteMany()]).then(database.disconnect))
})