const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const TEST_SECRET = process.env.REACT_APP_TEST_SECRET
const INITIAL_PLAYER_LIFE = process.env.REACT_APP_INITIAL_PLAYER_LIFE
const { random, floor } = Math
const playCard = require('.')
const { errors: { NotFoundError, ContentError, CantAttackError, CredentialsError, ConflictError } } = require('baam-util')
const { ObjectId, database, models: { Card, User, Game, Player } } = require('baam-data')
const jwt = require('jsonwebtoken')

describe('logic - play card', () => {

    beforeAll(() => database.connect(TEST_DB_URL))

    let userId, token, gameId, cardId, hand

    beforeEach(async () => {

        await Promise.all([Game.deleteMany(), User.deleteMany(), Player.deleteMany(), Card.deleteMany()])

        hand = []

        for (let i = 0; i < 4; i++) {
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
        userId = user1.id
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
            currentPlayer: 0
        }

        const game = await Game.create(newGame)
        gameId = game.id
    })

    it('should succed on DEFEND card play', async () => {
        let name = `Defend 2`
        let description = `description-${random()}`
        let image = `image-${random()}`
        let price = random()
        let col = ObjectId().toString()
        let effect = `DEFEND`
        let effectValue = 2
        let target = `target-${random()}`

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        await card.save()
        const game = await Game.findById(gameId)
        
        game.players[0].hand.push(card.id)
        await game.save()

        await playCard(gameId, token, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).toBeDefined()
        const [_player] = testGame.players
        expect(_player.defense).toBe(2)
        expect(_player.hand.length).toBe(4)

        expect(testGame.currentPlayer).toBe(1)
    })

    it('should succed on ATTACK card play', async () => {
        let name = `Attack 2`
        let description = `description-${random()}`
        let image = `image-${random()}`
        let price = random()
        let col = ObjectId().toString()
        let effect = `ATTACK`
        let effectValue = 5
        let target = `target-${random()}`

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        await card.save()
        const game = await Game.findById(gameId)
        
        game.players[0].hand.push(card.id)
        await game.save()

        await playCard(gameId, token, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).toBeDefined()
        const [_player1,_player2] = testGame.players
        expect(_player2.lifePoints).toBe(0)
        expect(_player1.hand.length).toBe(4)

        expect(testGame.winner).toBe(0)
        expect(testGame.status).toBe("END")
    })

    it('should not substract LifePoints on ATTACK when enemy has a DEFENSE', async () => {
        let name = `Attack 2`
        let description = `description-${random()}`
        let image = `image-${random()}`
        let price = random()
        let col = ObjectId().toString()
        let effect = `ATTACK`
        let effectValue = 2
        let target = `target-${random()}`

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        await card.save()
        const game = await Game.findById(gameId)
        game.players[1].defense = 3
        game.players[0].hand.push(card.id)
        await game.save()

        await playCard(gameId, token, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).toBeDefined()
        const [_player1,_player2] = testGame.players
        expect(_player2.lifePoints).toBe(5)
        expect(_player2.defense).toBe(1)
        expect(_player1.hand.length).toBe(4)

        expect(testGame.currentPlayer).toBe(1)
    })

    it('should remove a temporal Card from tempZone when its duration ends', async () => {
        let name = `Attack 2`
        let description = `description-${random()}`
        let image = `image-${random()}`
        let price = random()
        let col = ObjectId().toString()
        let effect = `ATTACK`
        let effectValue = 2
        let target = `target-${random()}`

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        await card.save()
        const game = await Game.findById(gameId)
        game.players[1].defense = 3
        game.players[0].hand.push(card.id)
        game.players[0].tempZone.card = ObjectId()
        game.players[0].tempZone.duration = 1

        await game.save()

        await playCard(gameId, token, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).toBeDefined()
        const [_player1,_player2] = testGame.players
        expect(_player2.lifePoints).toBe(5)
        expect(_player2.defense).toBe(1)
        expect(_player1.hand.length).toBe(4)
        expect(_player1.tempZone.card).toBe(null)
        expect(_player1.tempZone.duration).toBe(-1)
        expect(testGame.currentPlayer).toBe(1)
    })

    it('should succed on HEAL card play', async () => {
        let name = `Health 2`
        let description = `description-${random()}`
        let image = `image-${random()}`
        let price = random()
        let col = ObjectId().toString()
        let effect = `HEAL`
        let effectValue = 2
        let target = `target-${random()}`

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        cardId = card.id
        const game = await Game.findById(gameId)
        
        game.players[0].hand.push(card.id)
        await game.save()

        await playCard(gameId, token, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).toBeDefined()
        const [_player1] = testGame.players
        expect(_player1.lifePoints).toBe(7)
        expect(_player1.hand.length).toBe(4)

        expect(testGame.currentPlayer).toBe(1)
    })

    it('should succed on BLOCK card play', async () => {
        let name = `Block 2`
        let description = `description-${random()}`
        let image = `image-${random()}`
        let price = random()
        let col = ObjectId().toString()
        let effect = `BLOCK`
        let effectValue = 2
        let target = `target-${random()}`

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        await card.save()
        const game = await Game.findById(gameId)
        
        game.players[0].hand.push(card.id)
        await game.save()

        await playCard(gameId, token, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).toBeDefined()

        const [_player1,_player2] = testGame.players

        expect(_player1.tempZone.card).toBeDefined()
        expect(_player1.tempZone.duration).toBe(2)
        expect(_player2.attack).toBe(0)

        expect(testGame.currentPlayer).toBe(1)
    })

    it('should fail on ATTACK when player is BLOCKED', async () => {
        let name = `Attack 2`
        let description = `description-${random()}`
        let image = `image-${random()}`
        let price = random()
        let col = ObjectId().toString()
        let effect = `ATTACK`
        let effectValue = 5

        let target = `target-${random()}`

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        await card.save()
        const game = await Game.findById(gameId)
        
        game.players[0].hand.push(card.id)
        game.players[0].attack = 0
        await game.save()

        try {
            await playCard(gameId, token, card.id)
            throw Error ('should not reach this point')
        } catch(error) {
            expect (error).toBeDefined()
            expect(error).toBeInstanceOf(CantAttackError)
            expect (error.message).toBe(`you are blocked and can't attack`)
        }
    })

    it('should fail on incorrect EFFECT code', async () => {
        let name = `Attack 2`
        let description = `description-${random()}`
        let image = `image-${random()}`
        let price = random()
        let col = ObjectId().toString()
        let effect = `JAJAJA`
        let effectValue = 5
        let target = `target-${random()}`

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        await card.save()
        const game = await Game.findById(gameId)
        
        game.players[0].hand.push(card.id)
        game.players[0].attack = 0
        await game.save()

        try {
            await playCard(gameId, token, card.id)
            throw Error ('should not reach this point')
        } catch(error) {
            expect (error).toBeDefined()
            expect (error.message).toBe(`WTF?! can't recognize the card effect`)
        }
    })

    it('should end game when last Card is played and determine a tie', async () => {
        let name = `Attack 2`
        let description = `description-${random()}`
        let image = `image-${random()}`
        let price = random()
        let col = ObjectId().toString()
        let effect = `ATTACK`
        let effectValue = 2
        let target = `target-${random()}`

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        await card.save()
        const game = await Game.findById(gameId)
        game.players[1].defense = 3
        game.players[0].hand = []
        game.players[0].hand.push(card.id)
        await game.save()

        await playCard(gameId, token, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).toBeDefined()
        
        expect(testGame.status).toBe = 'END'
        expect(testGame.winner).toBe = -1
        expect(testGame.currentPlayer).toBe(0)
    })

    it('should change the tempzone card if exists one before', async () => {
        let name = `Block 2`
        let description = `description-${random()}`
        let image = `image-${random()}`
        let price = random()
        let col = ObjectId().toString()
        let effect = `BLOCK`
        let effectValue = 2
        let target = `target-${random()}`

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        await card.save()

        const game = await Game.findById(gameId)
        const tempId = ObjectId()
        game.players[1].defense = 3
        game.players[0].hand.push(card.id)
        game.players[0].tempZone.card = tempId
        game.players[0].tempZone.duration = 1
        await game.save()

        await playCard(gameId, token, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).toBeDefined()
        
        const [_player1,_player2] = testGame.players
        expect (_player1.discards).toBe = tempId
        expect (_player1.tempZone.card.toString()).toBe(card.id)
        expect (_player2.attack).toBe(0)
    })

    it('should end game when last Card is played and determine player1 winner', async () => {
        let name = `Attack 2`
        let description = `description-${random()}`
        let image = `image-${random()}`
        let price = random()
        let col = ObjectId().toString()
        let effect = `ATTACK`
        let effectValue = 2
        let target = `target-${random()}`

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        await card.save()
        const game = await Game.findById(gameId)
        game.players[0].hand = []
        game.players[0].hand.push(card.id)
        await game.save()

        await playCard(gameId, token, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).toBeDefined()
        
        expect(testGame.status).toBe('END')
        expect(testGame.winner).toBe(0)
        expect(testGame.currentPlayer).toBe(0)
    })

    it('should end game when last Card is played and determine player2 winner', async () => {
        let name = `Attack 2`
        let description = `description-${random()}`
        let image = `image-${random()}`
        let price = random()
        let col = ObjectId().toString()
        let effect = `DEFEND`
        let effectValue = 2
        let target = `target-${random()}`

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })
        await card.save()
        const game = await Game.findById(gameId)
        game.players[0].hand = []
        game.players[0].hand.push(card.id)
        game.players[1].lifePoints = 10
        await game.save()

        await playCard(gameId, token, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).toBeDefined()
        
        expect(testGame.status).toBe('END')
        expect(testGame.winner).toBe(1)
        expect(testGame.currentPlayer).toBe(0)
    })

    it('should fail on wrong game id', async () => {
        const game = ObjectId().toString()

        try {
            await playCard(game, token, cardId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`game with id ${game} not found`)
        }
    })

    it('should fail on wrong card id on hand and play', async () => {
        const wrongCard = ObjectId().toString()
        const game = await Game.findById(gameId)
        game.players[1].defense = 3
        game.players[0].hand = []
        game.players[0].hand.push(wrongCard)
        await game.save()
        try {
            await playCard(gameId, token, wrongCard)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`card with id ${wrongCard} not found`)
        }
    })

    it('should fail on wrong player id', async () => {
        const player = '012345678901234567890123'
        const badToken= jwt.sign({sub:player}, TEST_SECRET)
        try {
            await playCard(gameId, badToken, cardId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(CredentialsError)
            expect(error.message).toBe(`Is not the ${player} turn. Can't play the card`)
        }
    })

    it('should fail on wrong card id', async () => {
        const card = '012345678901234567890123'

        try {
            await playCard(gameId, token, card)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(Error)
            expect(error.message).toBe(`${userId} doesn't own the card ${card} on his hand`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => playCard(1)).toThrow(TypeError, '1 is not a string')
        expect(() => playCard(true)).toThrow(TypeError, 'true is not a string')
        expect(() => playCard([])).toThrow(TypeError, ' is not a string')
        expect(() => playCard({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => playCard(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => playCard(null)).toThrow(TypeError, 'null is not a string')
        
        expect(() => playCard('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => playCard(' \t\r')).toThrow(ContentError, 'id is empty or blank')

        expect(() => playCard(gameId,1)).toThrow(TypeError, '1 is not a string')
        expect(() => playCard(gameId,true)).toThrow(TypeError, 'true is not a string')
        expect(() => playCard(gameId,[])).toThrow(TypeError, ' is not a string')
        expect(() => playCard(gameId,{})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => playCard(gameId,undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => playCard(gameId,null)).toThrow(TypeError, 'null is not a string')
        
        expect(() => playCard(gameId,'')).toThrow(ContentError, 'id is empty or blank')
        expect(() => playCard(gameId,' \t\r')).toThrow(ContentError, 'id is empty or blank')

        expect(() => playCard(gameId, userId, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => playCard(gameId, userId, true)).toThrow(TypeError, 'true is not a string')
        expect(() => playCard(gameId, userId, [])).toThrow(TypeError, ' is not a string')
        expect(() => playCard(gameId, userId, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => playCard(gameId, userId, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => playCard(gameId, userId, null)).toThrow(TypeError, 'null is not a string')
        
        expect(() => playCard(gameId, userId, '')).toThrow(ContentError, 'id is empty or blank')
        expect(() => playCard(gameId, userId, ' \t\r')).toThrow(ContentError, 'id is empty or blank')
    })

    afterAll(() => Promise.all([Card.deleteMany(), User.deleteMany(), Game.deleteMany(), Player.deleteMany()])
        .then(database.disconnect))
})