const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const { random } = Math
const retrieveRandomCards = require('.')
const { errors: { NotFoundError, ContentError } } = require('baam-util')
const { ObjectId, database, models: { Card } } = require('baam-data')

describe('logic - retrieve random cards', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let cardIds = []

    beforeEach(async () => {
        await Card.deleteMany()
        
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

            cardIds.push(card.id)
        }

    })

    it('should succeed on correct card id', async () => {
        const cards = await retrieveRandomCards(2)

        expect(cards).toBeDefined()
        expect(cards).toBeInstanceOf(Array)
        expect(cards.length).toBe(2)
        cards.forEach(card => {
            expect(card._id).toBeUndefined()
            expect(cardIds).toContain(card.id)
        })        
    })

    it('should return as max as existing cards on longer size sent', async () => {
        const cards = await retrieveRandomCards(20)

        expect(cards).toBeDefined()
        expect(cards).toBeInstanceOf(Array)
        expect(cards.length).toBe(10)
        cards.forEach(card => {
            expect(card._id).toBeUndefined()
            expect(cardIds).toContain(card.id)
        })        
    })

    it('should fail on empty cards database', async () => {
        await Card.deleteMany()
        try {
            await retrieveRandomCards(2)
            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`there are no cards at Database!`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => retrieveRandomCards(true)).toThrow(TypeError, 'true is not a number')
        expect(() => retrieveRandomCards([])).toThrow(TypeError, ' is not a number')
        expect(() => retrieveRandomCards({})).toThrow(TypeError, '[object Object] is not a number')
        expect(() => retrieveRandomCards(undefined)).toThrow(TypeError, 'undefined is not a number')
        expect(() => retrieveRandomCards(null)).toThrow(TypeError, 'null is not a number')
        expect(() => retrieveRandomCards(-1)).toThrow(ContentError, 'please, size must be greater than 0')
    })

    afterAll(() => Card.deleteMany().then(database.disconnect))
})