const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const TEST_SECRET = process.env.REACT_APP_TEST_SECRET
const INITIAL_PLAYER_LIFE = process.env.REACT_APP_INITIAL_PLAYER_LIFE

const { random } = Math
const passTurn = require('.')
const { errors: { NotFoundError, ContentError, CredentialsError } } = require('baam-util')
const { ObjectId, database, models: { Card, User, Game, Player } } = require('baam-data')
const jwt = require ('jsonwebtoken')

describe('logic - pass turn', () => {

    beforeAll(() => database.connect(TEST_DB_URL))

    let token, gameId

    beforeEach(async () => {

        await Promise.all([Card.deleteMany(), Game.deleteMany(), User.deleteMany(), Player.deleteMany()])

        let cards = [], hand = []

        /****** CREATE CARDS */
        for (let i = 0; i < 9; i++) {
            let name = `name-${random()}`
            let description = `description-${random()}`
            let image = `image-${random()}`
            let price = random()
            let col = ObjectId().toString()
            let effect = `effect-${random()}`
            let effectValue = random()
            let target = `target-${random()}`

            let card = await Card.create({ name, description, image, price, col, effect, effectValue, target })

            cards.push(card._id)
            i < 4 && hand.push(card.id)
        }

        //****** CREATE USERS  */
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

        const user1 = await User.create({ name, surname, email, nickname, password, cards , stats})
        

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
        const user2 = await User.create({ name, surname, email, nickname, password, cards , stats})

        //****** CREATE PLAYERS AND GAME */
        const newPlayer1 = new Player({
            user: user1._id,
            lifePoints: parseInt(INITIAL_PLAYER_LIFE),
            hand,
            tempZone: {card: ObjectId().toString(), duration: 2},
            discards: [],
            modifier: false,
            attack: 1,
            defense: 0,
            lastAccess: new Date()
        })

        token = jwt.sign({sub: user1.id}, TEST_SECRET)

        const newPlayer2 = new Player({
            user: user2._id,
            lifePoints: parseInt(INITIAL_PLAYER_LIFE),
            hand: [],
            tempZone: null,
            discards: [],
            modifier: false,
            attack: 1,
            defense: 0,
            lastAccess: new Date()
        })

        const newGame = {
            players: [newPlayer1, newPlayer2],
            shots: [],
            currentPlayer: 0
        }

        const game = await Game.create(newGame)

        gameId = game.id
    })

    it('should succed on changing turn and decreassing 1 lifePoint when user pass', async()=> {
        
        await passTurn(gameId, token)

        const _game = await Game.findById(gameId)

        expect(_game.currentPlayer).toBe(1)
        expect(_game.players[0].lifePoints).toBe(parseInt(INITIAL_PLAYER_LIFE)-1)

    })

    it('should fail on wrong game id', async () => {
        const game = '012345678901234567890123'

        try {
            await passTurn(game, token)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`game with id ${game} not found`)
        }
    })

    it('should fail on wrong user id', async () => {
        const user = '012345678901234567890123'

        const badToken = jwt.sign ({sub: user}, TEST_SECRET)
        try {
            await passTurn(gameId, badToken)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(CredentialsError)
            expect(error.message).toBe(`Is not the ${user} turn. Can't play the card`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => passTurn(1)).toThrow(TypeError, '1 is not a string')
        expect(() => passTurn(true)).toThrow(TypeError, 'true is not a string')
        expect(() => passTurn([])).toThrow(TypeError, ' is not a string')
        expect(() => passTurn({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => passTurn(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => passTurn(null)).toThrow(TypeError, 'null is not a string')

        expect(() => passTurn('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => passTurn(' \t\r')).toThrow(ContentError, 'id is empty or blank')

        expect(() => passTurn(gameId,1)).toThrow(TypeError, '1 is not a string')
        expect(() => passTurn(gameId,true)).toThrow(TypeError, 'true is not a string')
        expect(() => passTurn(gameId,[])).toThrow(TypeError, ' is not a string')
        expect(() => passTurn(gameId,{})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => passTurn(gameId,undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => passTurn(gameId,null)).toThrow(TypeError, 'null is not a string')
        
        expect(() => passTurn(gameId,'')).toThrow(ContentError, 'id is empty or blank')
        expect(() => passTurn(gameId,' \t\r')).toThrow(ContentError, 'id is empty or blank')
    })

    afterAll(() => Promise.all([Card.deleteMany(), User.deleteMany(), Game.deleteMany(), Player.deleteMany()])
        .then(database.disconnect))
})