require('dotenv').config()

const { env: { TEST_DB_URL, HAND_LENGTH } } = process

const { expect } = require('chai')
const { random, floor } = Math
const addPlayerHand = require('.')
const { errors: { NotFoundError, ContentError, ConflictError } } = require('baam-util')
const { ObjectId, database, models: { Card, User, Game , Player} } = require('baam-data')

describe('logic - add player hand', () => {
    before(() => database.connect(TEST_DB_URL))

    let userId, gameId, hand = [], cards = []

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
        await addPlayerHand(gameId, userId, hand)

        const game = await Game.findById(gameId).lean()
        expect (game).to.exist

        expect (game.players[0].hand.length).to.equal(5)
        game.players[0].hand.forEach(card=>
            expect(hand).to.include(card.toString())
        )
    })

    it("should fail when hand size is diferent thant 5 cards", async()=> {
        const wrongHand = hand.slice(0,3)

        try {
            await addPlayerHand(gameId, userId, wrongHand)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ConflictError)
            expect(error.message).to.equal(`hand must have 5 cards to play`)
        }
    })

    it('should fail on wrong game id', async () => {
        const game = '012345678901234567890123'

        try {
            await addPlayerHand(game, userId, hand)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`game with id ${game} not found`)
        }
    })

    it('should fail on wrong player id', async () => {
        const player = '012345678901234567890123'

        try {
            await addPlayerHand(gameId, player, hand)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`${player} is not joined to game ${gameId}`)
        }
    })

    it('should fail on wrong hand length', async () => {
        hand.length--

        try {
            await addPlayerHand(gameId, userId, hand)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ConflictError)
            expect(error.message).to.equal(`hand must have ${HAND_LENGTH} cards to play`)
        }
    })

    it('should fail when hand has a wrong cardId', async () => {
        hand[4] = 'wrong'

        try {
            await addPlayerHand(gameId, userId, hand)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ConflictError)
            expect(error.message).to.equal(`hand must have ${HAND_LENGTH} cards to play`)
        }
    })

    it('should fail when hand has card not owned by player', async () => {
        hand[4] = ObjectId()

        try {
            await addPlayerHand(gameId, userId, hand)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ConflictError)
            expect(error.message).to.equal(`one or more cards doesn't pertain to player`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => addPlayerHand(1)).to.throw(TypeError, '1 is not a string')
        expect(() => addPlayerHand(true)).to.throw(TypeError, 'true is not a string')
        expect(() => addPlayerHand([])).to.throw(TypeError, ' is not a string')
        expect(() => addPlayerHand({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => addPlayerHand(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => addPlayerHand(null)).to.throw(TypeError, 'null is not a string')

        expect(() => addPlayerHand('wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => addPlayerHand('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => addPlayerHand(' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => addPlayerHand(gameId,1)).to.throw(TypeError, '1 is not a string')
        expect(() => addPlayerHand(gameId,true)).to.throw(TypeError, 'true is not a string')
        expect(() => addPlayerHand(gameId,[])).to.throw(TypeError, ' is not a string')
        expect(() => addPlayerHand(gameId,{})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => addPlayerHand(gameId,undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => addPlayerHand(gameId,null)).to.throw(TypeError, 'null is not a string')

        expect(() => addPlayerHand(gameId,'wrong')).to.throw(ContentError, `wrong is not a valid id`)


        expect(() => addPlayerHand(gameId,'')).to.throw(ContentError, 'id is empty or blank')
        expect(() => addPlayerHand(gameId,' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => addPlayerHand(gameId, userId, 1)).to.throw(TypeError, '1 is not a Array')
        expect(() => addPlayerHand(gameId, userId, true)).to.throw(TypeError, 'true is not a Array')
        expect(() => addPlayerHand(gameId, userId, 'as')).to.throw(TypeError, ' is not a Array')
        expect(() => addPlayerHand(gameId, userId, {})).to.throw(TypeError, '[object Object] is not a Array')
        expect(() => addPlayerHand(gameId, userId, undefined)).to.throw(TypeError, 'undefined is not a Array')
        expect(() => addPlayerHand(gameId, userId, null)).to.throw(TypeError, 'null is not a Array')
    })

    after (()=> Promise.all([User.deleteMany(), Game.deleteMany(), Player.deleteMany()])
        .then (database.disconnect))
})