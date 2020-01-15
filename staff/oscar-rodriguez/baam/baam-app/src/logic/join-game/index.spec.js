const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const TEST_SECRET = process.env.REACT_APP_TEST_SECRET
const PLAYER_LIFE = process.env.REACT_APP_INITIAL_PLAYER_LIFE
const { database, models: {User, Game, Player}} = require ('baam-data')
const {errors: { NotFoundError, ConflictError, ContentError}} = require ('baam-util')
const { random , floor } = Math
const joinGame = require('.')
const jwt = require ('jsonwebtoken')

describe('logic - join game', () => {
    beforeAll (()=> database.connect(TEST_DB_URL))

    let userId, token, token1, gameId, nickname, player1

    beforeEach(async ()=>{

        await Promise.all([User.deleteMany(), Game.deleteMany()])

        let name = `name-${random()}`
        let surname = `name-${random()}`
        let email = `name-${random()}@mail.com`
        nickname = `name-${random()}`
        let password = `name-${random()}`

        const user = await User.create ({name, surname, email, nickname, password})

        userId = user.id

        token = jwt.sign({sub: userId}, TEST_SECRET)

        player1 = await User.create ({name: `**-${random()}`, surname: `**-${random()}`, email: `**-${random()}`, nickname: `**-${random()}`, password: `**-${random()}`})

        player1 = player1.id

        token1 = jwt.sign({sub:player1}, TEST_SECRET)

        const newPlayer = new Player ({
            user: player1,
            lifePoints: PLAYER_LIFE,
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
        await joinGame(token, gameId)

        const game = await Game.findById(gameId)
        expect (game.id).toBe(gameId)
        expect (game.players.length).toBe(2)
        expect (game.players[1]).toBeDefined()
        expect (game.players[1].user.toString()).toBe(userId)
    })

    it('should fail when trying to ad same player two times', async()=>{
        
        try {
            
            await joinGame(token1, gameId)

            throw new Error ('shouldnt reach this point')
        } catch (error) {
            expect (error).toBeDefined()
            expect(error).toBeInstanceOf(Error)
            expect (error.message).toBe("can't join same user 2 times")
        }

    })

    it('should fail on wrong player id', async () => {
        const player = '012345678901234567890123'
        const newtoken = jwt.sign ({sub: player}, TEST_SECRET)

        try {
            await joinGame(newtoken, gameId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user not found`)
        }
    })

    it('should fail on wrong game id', async () => {
        const game = '012345678901234567890123'

        try {
            await joinGame(token, game)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`game not found`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => joinGame(1)).toThrow(TypeError, '1 is not a string')
        expect(() => joinGame(true)).toThrow(TypeError, 'true is not a string')
        expect(() => joinGame([])).toThrow(TypeError, ' is not a string')
        expect(() => joinGame({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => joinGame(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => joinGame(null)).toThrow(TypeError, 'null is not a string')

        expect(() => joinGame('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => joinGame(' \t\r')).toThrow(ContentError, 'id is empty or blank')

        expect(() => joinGame(gameId,1)).toThrow(TypeError, '1 is not a string')
        expect(() => joinGame(gameId,true)).toThrow(TypeError, 'true is not a string')
        expect(() => joinGame(gameId,[])).toThrow(TypeError, ' is not a string')
        expect(() => joinGame(gameId,{})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => joinGame(gameId,undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => joinGame(gameId,null)).toThrow(TypeError, 'null is not a string')

        expect(() => joinGame(gameId,'')).toThrow(ContentError, 'id is empty or blank')
        expect(() => joinGame(gameId,' \t\r')).toThrow(ContentError, 'id is empty or blank')

    })

    afterAll (()=> Promise.all([User.deleteMany(), Game.deleteMany()])
        .then (database.disconnect))
})