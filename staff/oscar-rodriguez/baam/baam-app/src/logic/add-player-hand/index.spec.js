const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const TEST_SECRET = process.env.REACT_APP_TEST_SECRET
const HAND_LENGTH = process.env.REACT_APP_HAND_LENGTH
const { random, floor } = Math
const addPlayerHand = require('.')
const { errors: { NotFoundError, ContentError, ConflictError } } = require('baam-util')
const { ObjectId, database, models: { Card, User, Game , Player} } = require('baam-data')
const jwt = require ('jsonwebtoken')

describe('logic - add player hand', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let userId, token, gameId, hand = [], cards = []

    let description, image, price, col, effect, effectValue, target, name

    beforeEach(async () => {
        await Promise.all([Game.deleteMany(), Card.deleteMany(), User.deleteMany()])
        hand = [], cards = []

        for (let i = 0; i < 10; i++) {
            name = `name-${random()}`
            description = `description-${random()}`
            image = `image-${random()}`
            price = random()
            col = ObjectId().toString()
            effect = `effect-${random()}`
            effectValue = random()
            target = `target-${random()}`
            
            const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
            
            cards.push(card._id)
            i < 5 && hand.push(card.id)
        }
        
        name = `name-${random()}`
        let surname = `surname-${random()}`
        let email = `email-${random()}@mail.com`
        let nickname = `nickname-${random()}`
        let password = `password-${random()}`

        const user = await User.create({ name, surname, email, nickname, password, cards })

        cards.forEach(card=>{
            card.id = card._id
            delete card._id
        })
        
        const newPlayer1 = new Player({
            user: user._id,
            lifePoints: 5,
            hand: [],
            tempZone: null,
            discards: [],
            modifier: false,
            attack: 1,
            defense: 0,
            lastAccess: new Date()
        })
        
        userId = user.id

        token = jwt.sign ({sub: userId}, TEST_SECRET)
        
        const newPlayer2 = new Player({
            user: ObjectId(),
            lifePoints: 5,
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
            currentPlayer: floor(random() * 2)
        }

        const game = await Game.create(newGame)

        gameId = game.id
    })

    it("should update player's hand with the selected cards", async()=>{
        await addPlayerHand(gameId, token, hand)

        const game = await Game.findById(gameId).lean()
        expect (game).toBeDefined()

        expect (game.players[0].hand.length).toBe(5)
        game.players[0].hand.forEach(card=>
            expect(hand).toContain(card.toString())
        )
    })

    it("should fail when hand size is diferent thant 5 cards", async()=> {
        const wrongHand = hand.slice(0,3)

        try {
            await addPlayerHand(gameId, token, wrongHand)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(ConflictError)
            expect(error.message).toBe(`hand must have 5 cards to play`)
        }
    })

    it('should fail on wrong game id', async () => {
        const game = '012345678901234567890123'

        try {
            await addPlayerHand(game, token, hand)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`game with id ${game} not found`)
        }
    })

    it('should fail on wrong player id', async () => {
        const player = '012345678901234567890123'

        token = jwt.sign({sub:player}, TEST_SECRET)

        try {
            await addPlayerHand(gameId, token, hand)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`${player} is not joined to game ${gameId}`)
        }
    })

    it('should fail on wrong hand length', async () => {
        hand.length--

        try {
            await addPlayerHand(gameId, token, hand)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(ConflictError)
            expect(error.message).toBe(`hand must have ${HAND_LENGTH} cards to play`)
        }
    })

    it('should fail when hand has a wrong cardId', async () => {
        hand[4] = 'wrong'

        try {
            await addPlayerHand(gameId, token, hand)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(`hand must have ${HAND_LENGTH} cards to play`)
        }
    })

    it('should fail when hand has card not owned by player', async () => {
        hand[4] = ObjectId()

        try {
            await addPlayerHand(gameId, token, hand)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(`one or more cards doesn't pertain to player`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => addPlayerHand(1)).toThrow(TypeError, '1 is not a string')
        expect(() => addPlayerHand(true)).toThrow(TypeError, 'true is not a string')
        expect(() => addPlayerHand([])).toThrow(TypeError, ' is not a string')
        expect(() => addPlayerHand({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => addPlayerHand(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => addPlayerHand(null)).toThrow(TypeError, 'null is not a string')

        expect(() => addPlayerHand('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => addPlayerHand(' \t\r')).toThrow(ContentError, 'id is empty or blank')

        expect(() => addPlayerHand(gameId,1)).toThrow(TypeError, '1 is not a string')
        expect(() => addPlayerHand(gameId,true)).toThrow(TypeError, 'true is not a string')
        expect(() => addPlayerHand(gameId,[])).toThrow(TypeError, ' is not a string')
        expect(() => addPlayerHand(gameId,{})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => addPlayerHand(gameId,undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => addPlayerHand(gameId,null)).toThrow(TypeError, 'null is not a string')

        expect(() => addPlayerHand(gameId,'')).toThrow(ContentError, 'id is empty or blank')
        expect(() => addPlayerHand(gameId,' \t\r')).toThrow(ContentError, 'id is empty or blank')

        expect(() => addPlayerHand(gameId, userId, 1)).toThrow(TypeError, '1 is not a Array')
        expect(() => addPlayerHand(gameId, userId, true)).toThrow(TypeError, 'true is not a Array')
        expect(() => addPlayerHand(gameId, userId, 'as')).toThrow(TypeError, ' is not a Array')
        expect(() => addPlayerHand(gameId, userId, {})).toThrow(TypeError, '[object Object] is not a Array')
        expect(() => addPlayerHand(gameId, userId, undefined)).toThrow(TypeError, 'undefined is not a Array')
        expect(() => addPlayerHand(gameId, userId, null)).toThrow(TypeError, 'null is not a Array')
    })

    afterAll (()=> Promise.all([User.deleteMany(), Game.deleteMany(), Player.deleteMany()])
        .then (database.disconnect))
})