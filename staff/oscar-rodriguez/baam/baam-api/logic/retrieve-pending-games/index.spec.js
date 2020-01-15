require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const chai = require('chai')
const { expect } = chai
const chaiSubset = require('chai-subset')
chai.use(chaiSubset)
const { random, floor } = Math
const retrievePendingGames = require('.')
const { errors: { NotFoundError, ContentError } } = require('baam-util')
const { ObjectId, database, models: { User, Game , Player} } = require('baam-data')

describe('logic - retrieve game', () => {

    before(() => database.connect(TEST_DB_URL))

    let nickname1, nickname2, game1Id, game2Id

    beforeEach(async () => {
        await Promise.all([Game.deleteMany()])

        let name = `name-${random()}`
        let surname = `surname-${random()}`
        let email = `email-${random()}@mail.com`
        nickname1 = `nickname-${random()}`
        nickname2 = `nickname-${random()}`
        let password = `password-${random()}`

        const user = await User.create({ name, surname, email, nickname: nickname1, password })
        const user2 = await User.create({ name, surname, email, nickname: nickname2, password })
        
        const newPlayer1 = new Player({
            user: user.id,
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
            user: user2.id,
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
        game1Id = games[0].id
        game2Id = games[1].id

    })

    it('should return the games on PENDING status', async () => {
        const games = await retrievePendingGames()

        expect(games).to.exist
        expect(games).to.be.an.instanceOf(Array)
        expect(games.length).to.equal(2)

        expect(games[0].id).to.equal(game1Id)
        expect(games[0].nickname).to.equal(nickname1)
        
        expect(games[1].id).to.equal(game2Id)
        expect(games[1].nickname).to.equal(nickname2)
    })

    it('should return empty array if no PENDING games', async () => {
        
        await Game.deleteMany()

        const games = await retrievePendingGames ()
        expect (games).to.be.an.instanceOf(Array)
        expect (games.length).to.equal(0)
    })

    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(database.disconnect))
})