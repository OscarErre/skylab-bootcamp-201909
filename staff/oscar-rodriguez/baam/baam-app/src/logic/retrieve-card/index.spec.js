const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const { random } = Math
const retrieveCard = require('.')
const { errors: { NotFoundError, ContentError } } = require('baam-util')
const { ObjectId, database, models: { Card } } = require('baam-data')

describe('logic - retrieve card', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let id, name, description, image, price, col, effect, effectValue, target

    beforeEach(async () => {
        name = `name-${random()}`
        description = `description-${random()}`
        image = `image-${random()}`
        price = random()
        col = ObjectId().toString()
        effect = `effect-${random()}`
        effectValue = random()
        target = `target-${random()}`

        await Card.deleteMany()

        const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })

        id = card.id
    })

    it('should succeed on correct card id', async () => {
        const card = await retrieveCard(id)

        expect(card).toBeDefined()
        expect(card.id).toBe(id)
        expect(typeof card.id).toBe('string')
        expect(card._id).toBeUndefined()
        expect(card.name).toBe(name)
        expect(typeof card.name).toBe('string')
        expect(card.description).toBe(description)
        expect(typeof card.description).toBe('string')
        expect(card.image).toBe(image)
        expect(typeof card.image).toBe('string')
        expect(card.price).toBe(price)
        expect(typeof card.price).toBe('number')
        expect(card.col.toString()).toBe(col)
        expect(typeof card.col.toString()).toBe('string')
        expect(card.effect).toBe(effect)
        expect(typeof card.effect).toBe('string')
        expect(card.effectValue).toBe(effectValue)
        expect(typeof card.effectValue).toBe('number')
        expect(card.target).toBe(target)
        expect(typeof card.target).toBe('string')
        
    })

    it('should fail on wrong card id', async () => {
        const id = '012345678901234567890123'

        try {
            await retrieveCard(id)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`card with id ${id} not found`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => retrieveCard(1)).toThrow(TypeError, '1 is not a string')
        expect(() => retrieveCard(true)).toThrow(TypeError, 'true is not a string')
        expect(() => retrieveCard([])).toThrow(TypeError, ' is not a string')
        expect(() => retrieveCard({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => retrieveCard(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => retrieveCard(null)).toThrow(TypeError, 'null is not a string')

        expect(() => retrieveCard('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => retrieveCard(' \t\r')).toThrow(ContentError, 'id is empty or blank')
    })

    afterAll(() => Card.deleteMany().then(database.disconnect))
})