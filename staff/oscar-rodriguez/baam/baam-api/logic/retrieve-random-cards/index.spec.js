require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const retrieveRandomCards = require('.')
const { errors: { NotFoundError, ContentError } } = require('baam-util')
const { ObjectId, database, models: { Card } } = require('baam-data')

describe('logic - retrieve random cards', () => {
    before(() => database.connect(TEST_DB_URL))

    let cardIds = []

    beforeEach(async () => {
        await Card.deleteMany()
        
        for (let i=0; i<10; i++) {
            name = `name-${random()}`
            description = `description-${random()}`
            image = `image-${random()}`
            price = random()
            col = ObjectId().toString()
            effect = `effect-${random()}`
            effectValue = random()
            target = `target-${random()}`
    
    
            const card = await Card.create({ name, description, image, price, col, effect, effectValue, target })

            cardIds.push(card.id)
        }

    })

    it('should succeed on correct card id', async () => {
        const cards = await retrieveRandomCards(2)
        expect(cards).to.exist
        expect(cards).to.be.an.instanceOf(Array)
        expect(cards.length).to.equal(2)
        cards.forEach(card => {
            expect(card._id).to.not.exist
            expect(card.id).to.be.oneOf(cardIds)
        })        
    })

    it('should return as max as existing cards on longer size sent', async () => {
        const cards = await retrieveRandomCards(20)
        expect(cards).to.exist
        expect(cards).to.be.an.instanceOf(Array)
        expect(cards.length).to.equal(10)
        cards.forEach(card => {
            expect(card._id).to.not.exist
            expect(card.id).to.be.oneOf(cardIds)
        })        
    })

    it('should fail on empty cards database', async () => {
        await Card.deleteMany()
        try {
            await retrieveRandomCards(2)
            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`there are no cards at Database!`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => retrieveRandomCards(true)).to.throw(TypeError, 'true is not a number')
        expect(() => retrieveRandomCards([])).to.throw(TypeError, ' is not a number')
        expect(() => retrieveRandomCards({})).to.throw(TypeError, '[object Object] is not a number')
        expect(() => retrieveRandomCards(undefined)).to.throw(TypeError, 'undefined is not a number')
        expect(() => retrieveRandomCards(null)).to.throw(TypeError, 'null is not a number')
        expect(() => retrieveRandomCards(-1)).to.throw(ContentError, 'please, size must be greater than 0')
    })

    after(() => Card.deleteMany().then(database.disconnect))
})