require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const chai = require('chai')
const { expect } = chai
const chaiSubset = require('chai-subset')
chai.use(chaiSubset)
const { random, floor } = Math
const retrieveGame = require('.')
const { errors: { NotFoundError, ContentError } } = require('baam-util')
const { ObjectId, database, models: { User, Game , Player, Card} } = require('baam-data')

describe('logic - retrieve game', () => {

    before(() => database.connect(TEST_DB_URL))

    let gameId, userId, playerId

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

        playerId = newPlayer1.id
        
        const newPlayer2 = new Player({
            user: user2.id,
            lifePoints: 5,
            hand,
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
            currentPlayer: floor(random() * 2)
        }

        const game = await Game.create(newGame)
        gameId = game.id

    })

    it('should return the game status on valid userId, which is in the game', async () => {
        const game = await retrieveGame(gameId, userId)

        expect(game).to.exist
        expect(game.id).to.equal(gameId)
        expect(game.players).to.containSubset([{id: playerId}])

        expect(game.shoots).to.be.an.instanceOf(Array)
        expect(game.currentPlayer).to.be.a('number')
        expect([0,1]).to.include(game.currentPlayer)

        expect(game.players[0].tempZone.card.id).to.exist
        expect(game.players[0].tempZone.card._id).to.not.exist

        expect(game.players[0].discards[0].id).to.exist
        expect(game.players[0].discards[0]._id).to.not.exist

        expect(game.players[0].hand[0].id).to.exist
        expect(game.players[0].hand[0]._id).to.not.exist

        expect(game.players[1].hand[0]).to.equal(undefined)

    })

    it('should fail on valid userId, which is NOT in the game', async () => {
        const wrong = ObjectId().toString()
        try {
            await retrieveGame(gameId, wrong)
            throw Error('should not reach this poing')
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal(`${wrong} can't get info from a game where is not joined`)
        }
    })

    it('should fail on wrong game id', async () => {
        const wrong = '012345678901234567890123'

        try {
            await retrieveGame(wrong, userId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`game with id ${wrong} not found`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => retrieveGame(1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveGame(true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveGame([])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveGame({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveGame(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveGame(null)).to.throw(TypeError, 'null is not a string')
        expect(() => retrieveGame('wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => retrieveGame('')).to.throw(ContentError, 'gameId is empty or blank')
        expect(() => retrieveGame(' \t\r')).to.throw(ContentError, 'gameId is empty or blank')

        expect(() => retrieveGame(gameId, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveGame(gameId, true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveGame(gameId, [])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveGame(gameId, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveGame(gameId, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveGame(gameId, null)).to.throw(TypeError, 'null is not a string')
        expect(() => retrieveGame(gameId, 'wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => retrieveGame(gameId, '')).to.throw(ContentError, 'playerId is empty or blank')
        expect(() => retrieveGame(gameId, ' \t\r')).to.throw(ContentError, 'playerId is empty or blank')
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(database.disconnect))
})