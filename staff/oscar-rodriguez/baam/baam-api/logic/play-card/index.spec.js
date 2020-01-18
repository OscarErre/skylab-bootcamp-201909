require('dotenv').config()
const { env: { TEST_DB_URL, HAND_LENGTH, INITIAL_PLAYER_LIFE } } = process
const chai = require('chai')
const { expect } = chai
const chaiSubset = require('chai-subset')
chai.use(chaiSubset)
const { random, floor } = Math
const playCard = require('.')
const { errors: { NotFoundError, ContentError, CantAttackError, CredentialsError, ConflictError } } = require('baam-util')
const { ObjectId, database, models: { Card, User, Game, Player } } = require('baam-data')

describe('logic - play card', () => {

    before(() => database.connect(TEST_DB_URL))

    let userId, gameId, cardId

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
            cardId = card.id
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

        userId = user1.id

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

        await playCard(gameId, userId, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).to.exist
        const [_player] = testGame.players
        expect(_player.defense).to.equal(2)
        expect(_player.hand.length).to.equal(4)

        expect(testGame.currentPlayer).to.equal(1)
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

        await playCard(gameId, userId, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).to.exist
        const [_player1,_player2] = testGame.players
        expect(_player2.lifePoints).to.equal(0)
        expect(_player1.hand.length).to.equal(4)

        expect(testGame.winner).to.equal(0)
        expect(testGame.status).to.equal("END")
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

        await playCard(gameId, userId, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).to.exist
        const [_player1,_player2] = testGame.players
        expect(_player2.lifePoints).to.equal(5)
        expect(_player2.defense).to.equal(1)
        expect(_player1.hand.length).to.equal(4)

        expect(testGame.currentPlayer).to.equal(1)
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

        await playCard(gameId, userId, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).to.exist
        const [_player1,_player2] = testGame.players
        expect(_player2.lifePoints).to.equal(5)
        expect(_player2.defense).to.equal(1)
        expect(_player1.hand.length).to.equal(4)
        expect(_player1.tempZone.card).to.equal(null)
        expect(_player1.tempZone.duration).to.equal(-1)
        expect(testGame.currentPlayer).to.equal(1)
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
        await card.save()
        const game = await Game.findById(gameId)
        
        game.players[0].hand.push(card.id)
        await game.save()

        await playCard(gameId, userId, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).to.exist
        const [_player1] = testGame.players
        expect(_player1.lifePoints).to.equal(7)
        expect(_player1.hand.length).to.equal(4)

        expect(testGame.currentPlayer).to.equal(1)
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

        await playCard(gameId, userId, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).to.exist

        const [_player1,_player2] = testGame.players

        expect(_player1.tempZone.card).to.exist
        expect(_player1.tempZone.duration).to.equal(2)
        expect(_player2.attack).to.equal(0)

        expect(testGame.currentPlayer).to.equal(1)
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
            await playCard(gameId, userId, card.id)
            throw Error ('should not reach this point')
        } catch(error) {
            expect (error).to.exist
            expect(error).to.be.an.instanceOf(CantAttackError)
            expect (error.message).to.equal(`you are blocked and can't attack`)
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
            await playCard(gameId, userId, card.id)
            throw Error ('should not reach this point')
        } catch(error) {
            expect (error).to.exist
            expect (error.message).to.equal(`WTF?! can't recognize the card effect`)
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

        await playCard(gameId, userId, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).to.exist
        
        expect(testGame.status).to.equal = 'END'
        expect(testGame.winner).to.equal = -1
        expect(testGame.currentPlayer).to.equal(0)
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

        await playCard(gameId, userId, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).to.exist
        
        const [_player1,_player2] = testGame.players
        expect (_player1.discards).to.equal = tempId
        expect (_player1.tempZone.card.toString()).to.equal(card.id)
        expect (_player2.attack).to.equal(0)
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

        await playCard(gameId, userId, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).to.exist
        
        expect(testGame.status).to.equal = 'END'
        expect(testGame.winner).to.equal = 0
        expect(testGame.currentPlayer).to.equal(0)
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

        await playCard(gameId, userId, card.id)

        const testGame = await Game.findById(gameId)
        expect(testGame).to.exist
        
        expect(testGame.status).to.equal = 'END'
        expect(testGame.winner).to.equal = 1
        expect(testGame.currentPlayer).to.equal(0)
    })

    it('should fail on wrong game id', async () => {
        const game = '012345678901234567890123'

        try {
            await playCard(game, userId, cardId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`game with id ${game} not found`)
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
            await playCard(gameId, userId, wrongCard)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`card with id ${wrongCard} not found`)
        }
    })

    it('should fail on wrong user id', async () => {
        const user = '012345678901234567890123'

        try {
            await playCard(gameId, user, cardId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(CredentialsError)
            expect(error.message).to.equal(`Is not the ${user} turn. Can't play the card`)
        }
    })

    it('should fail on wrong card id', async () => {
        const card = '012345678901234567890123'

        try {
            await playCard(gameId, userId, card)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ConflictError)
            expect(error.message).to.equal(`${userId} doesn't own the card ${card} on his hand`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => playCard(1)).to.throw(TypeError, '1 is not a string')
        expect(() => playCard(true)).to.throw(TypeError, 'true is not a string')
        expect(() => playCard([])).to.throw(TypeError, ' is not a string')
        expect(() => playCard({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => playCard(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => playCard(null)).to.throw(TypeError, 'null is not a string')
        expect(() => playCard('wrong')).to.throw(ContentError, `wrong is not a valid id`)


        expect(() => playCard('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => playCard(' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => playCard(gameId,1)).to.throw(TypeError, '1 is not a string')
        expect(() => playCard(gameId,true)).to.throw(TypeError, 'true is not a string')
        expect(() => playCard(gameId,[])).to.throw(TypeError, ' is not a string')
        expect(() => playCard(gameId,{})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => playCard(gameId,undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => playCard(gameId,null)).to.throw(TypeError, 'null is not a string')
        expect(() => playCard(gameId,'wrong')).to.throw(ContentError, `wrong is not a valid id`)


        expect(() => playCard(gameId,'')).to.throw(ContentError, 'id is empty or blank')
        expect(() => playCard(gameId,' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => playCard(gameId, userId, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => playCard(gameId, userId, true)).to.throw(TypeError, 'true is not a string')
        expect(() => playCard(gameId, userId, [])).to.throw(TypeError, ' is not a string')
        expect(() => playCard(gameId, userId, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => playCard(gameId, userId, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => playCard(gameId, userId, null)).to.throw(TypeError, 'null is not a string')
        expect(() => playCard(gameId, userId, 'wrong')).to.throw(ContentError, `wrong is not a valid id`)


        expect(() => playCard(gameId, userId, '')).to.throw(ContentError, 'id is empty or blank')
        expect(() => playCard(gameId, userId, ' \t\r')).to.throw(ContentError, 'id is empty or blank')
    })

    after(() => Promise.all([Card.deleteMany(), User.deleteMany(), Game.deleteMany(), Player.deleteMany()])
        .then(database.disconnect))
})