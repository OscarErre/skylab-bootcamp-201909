const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const TEST_SECRET = process.env.REACT_APP_TEST_SECRET
const { random } = Math
const retrieveUserCards = require('.')
const { errors: { NotFoundError, ContentError } } = require('baam-util')
const { ObjectId, database, models: { Card, User } } = require('baam-data')
const jwt = require ('jsonwebtoken')

describe('logic - retrieve user Cards', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let id, token

    beforeEach(async () => {
        await Promise.all([Card.deleteMany()],User.deleteMany())

        name = `name-${random()}`
        let surname = `surname-${random()}`
        let email = `email-${random()}@mail.com`
        let nickname = `nickname-${random()}`
        let password = `password-${random()}`

        const user = await User.create({ name, surname, email, nickname, password })

        id = user.id

        token = jwt.sign({sub:id}, TEST_SECRET)

        for (let i=0; i<10; i++) {
            let name = `name-${random()}`
            let description = `description-${random()}`
            let image = `image-${random()}`
            let price = random()
            let col = ObjectId().toString()
            let effect = `effect-${random()}`
            let effectValue = random()
            let target = `target-${random()}`

            const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })

            i<5 && user.cards.push (card.id)
        }
        await user.save()

    })

    it('should succeed on correct user id', async () => {
        const cards = await retrieveUserCards(token)

        expect(cards).toBeDefined()
        expect(cards.length).toBe(5)

        cards.forEach(card=> {
            expect(typeof card.id).toBe('string')
            expect(card._id).toBeUndefined()
            expect(typeof card.name).toBe('string')
            expect(typeof card.description).toBe('string')
            expect(typeof card.image).toBe('string')
            expect(typeof card.price).toBe('number')
            expect(typeof card.col.toString()).toBe('string')
            expect(typeof card.effect).toBe('string')
            expect(typeof card.effectValue).toBe('number')
            expect(typeof card.target).toBe('string')
        })
        
    })

    it('should fail on wrong user id', async () => {
        const id = '012345678901234567890123'

        token = jwt.sign({sub:id}, TEST_SECRET)

        try {
            await retrieveUserCards(token)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user with id ${id} not found`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => retrieveUserCards(1)).toThrow(TypeError, '1 is not a string')
        expect(() => retrieveUserCards(true)).toThrow(TypeError, 'true is not a string')
        expect(() => retrieveUserCards([])).toThrow(TypeError, ' is not a string')
        expect(() => retrieveUserCards({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => retrieveUserCards(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => retrieveUserCards(null)).toThrow(TypeError, 'null is not a string')

        expect(() => retrieveUserCards('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => retrieveUserCards(' \t\r')).toThrow(ContentError, 'id is empty or blank')
    })

    afterAll(() => Card.deleteMany().then(database.disconnect))
})