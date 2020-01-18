require('dotenv').config()
const { env: { TEST_DB_URL, INITIAL_PLAYER_LIFE } } = process
const chai = require('chai')
const { expect } = chai
const chaiSubset = require('chai-subset')
chai.use(chaiSubset)
const { random } = Math
const passTurn = require('.')
const { errors: { NotFoundError, ContentError, CredentialsError } } = require('baam-util')
const { ObjectId, database, models: { Card, User, Game, Player } } = require('baam-data')

describe('logic - pass turn', () => {

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

    it ('should succed on changing turn and decreassing 1 lifePoint when user pass', async()=> {
        
        await passTurn(gameId, userId)

        const _game = await Game.findById(gameId)

        expect(_game.currentPlayer).to.equal(1)
        expect(_game.players[0].lifePoints).to.equal(parseInt(INITIAL_PLAYER_LIFE)-1)

    })

    it('should fail on wrong game id', async () => {
        const game = '012345678901234567890123'

        try {
            await passTurn(game, userId, cardId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`game with id ${game} not found`)
        }
    })

    it('should fail on wrong user id', async () => {
        const user = '012345678901234567890123'

        try {
            await passTurn(gameId, user, cardId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(CredentialsError)
            expect(error.message).to.equal(`Is not the ${user} turn. Can't play the card`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => passTurn(1)).to.throw(TypeError, '1 is not a string')
        expect(() => passTurn(true)).to.throw(TypeError, 'true is not a string')
        expect(() => passTurn([])).to.throw(TypeError, ' is not a string')
        expect(() => passTurn({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => passTurn(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => passTurn(null)).to.throw(TypeError, 'null is not a string')
        expect(() => passTurn('wrong')).to.throw(ContentError, `wrong is not a valid id`)


        expect(() => passTurn('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => passTurn(' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => passTurn(gameId,1)).to.throw(TypeError, '1 is not a string')
        expect(() => passTurn(gameId,true)).to.throw(TypeError, 'true is not a string')
        expect(() => passTurn(gameId,[])).to.throw(TypeError, ' is not a string')
        expect(() => passTurn(gameId,{})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => passTurn(gameId,undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => passTurn(gameId,null)).to.throw(TypeError, 'null is not a string')
        expect(() => passTurn(gameId,'wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => passTurn(gameId,'')).to.throw(ContentError, 'id is empty or blank')
        expect(() => passTurn(gameId,' \t\r')).to.throw(ContentError, 'id is empty or blank')
    })

    after(() => Promise.all([Card.deleteMany(), User.deleteMany(), Game.deleteMany(), Player.deleteMany()])
        .then(database.disconnect))
})