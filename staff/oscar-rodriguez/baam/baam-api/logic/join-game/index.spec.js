const {expect } = require ('chai')
require ('dotenv').config()
const { env: { TEST_DB_URL }} = process
const { database, models: {User, Game, Player}} = require ('baam-data')
const {errors: { NotFoundError, ConflictError, ContentError}} = require ('baam-util')
const { random , floor } = Math
const joinGame = require('.')


describe('logic - join game', () => {
    before (()=> database.connect(TEST_DB_URL))

    let userId, gameId, nickname, player1

    beforeEach(async ()=>{

        await Promise.all([User.deleteMany(), Game.deleteMany()])

        let name = `name-${random()}`
        let surname = `name-${random()}`
        let email = `name-${random()}@mail.com`
        nickname = `name-${random()}`
        let password = `name-${random()}`

        const user = await User.create ({name, surname, email, nickname, password})

        userId = user.id

        player1 = await User.create ({name: `**-${random()}`, surname: `**-${random()}`, email: `**-${random()}`, nickname: `**-${random()}`, password: `**-${random()}`})

        player1 = player1.id

        const newPlayer = new Player ({
            user: player1,
            lifePoints: 5,
            hand: [],
            tempZone: null,
            discards: [],
            modifier: false,
            attack: 1,
            defense: 0
        })

        const newGame = {
            players: [newPlayer],
            shots: [],
            currentPlayer: floor(random() * 2)
        }

        const game = await Game.create(newGame)

        gameId = game.id
    })


    it ('should add the player into the especified game', async ()=> {
        await joinGame(userId, gameId)

        const game = await Game.findById(gameId)
        expect (game.id).to.equal(gameId)
        expect (game.players.length).to.equal(2)
        expect (game.players[1]).to.exist
        expect (game.players[1].user.toString()).to.equal(userId)
    })

    it('should fail when trying to ad same player two times', async()=>{
        
        try {
            await joinGame(player1, gameId)
            throw new Error ('shouldnt reach this point')
        } catch (error) {
            expect (error).to.exist
            expect(error).to.be.an.instanceOf(ConflictError)
            expect (error.message).to.equal("can't join same user 2 times")
        }

    })

    it('should fail on wrong player id', async () => {
        const player = '012345678901234567890123'

        try {
            await joinGame(player, gameId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user not found`)
        }
    })

    it('should fail on wrong game id', async () => {
        const game = '012345678901234567890123'

        try {
            await joinGame(player1, game)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`game not found`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => joinGame(1)).to.throw(TypeError, '1 is not a string')
        expect(() => joinGame(true)).to.throw(TypeError, 'true is not a string')
        expect(() => joinGame([])).to.throw(TypeError, ' is not a string')
        expect(() => joinGame({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => joinGame(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => joinGame(null)).to.throw(TypeError, 'null is not a string')
        expect(() => joinGame('wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => joinGame('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => joinGame(' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => joinGame(gameId,1)).to.throw(TypeError, '1 is not a string')
        expect(() => joinGame(gameId,true)).to.throw(TypeError, 'true is not a string')
        expect(() => joinGame(gameId,[])).to.throw(TypeError, ' is not a string')
        expect(() => joinGame(gameId,{})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => joinGame(gameId,undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => joinGame(gameId,null)).to.throw(TypeError, 'null is not a string')
        expect(() => joinGame(gameId,'wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => joinGame(gameId,'')).to.throw(ContentError, 'id is empty or blank')
        expect(() => joinGame(gameId,' \t\r')).to.throw(ContentError, 'id is empty or blank')

    })

    after (()=> Promise.all([User.deleteMany(), Game.deleteMany()])
        .then (database.disconnect))
})