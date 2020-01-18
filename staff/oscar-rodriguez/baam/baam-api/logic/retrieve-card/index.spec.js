require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const retrieveCard = require('.')
const { errors: { NotFoundError, ContentError } } = require('baam-util')
const { ObjectId, database, models: { Card } } = require('baam-data')

describe('logic - retrieve card', () => {
    before(() => database.connect(TEST_DB_URL))

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

        expect(card).to.exist
        expect(card.id).to.equal(id)
        expect(card.id).to.be.a('string')
        expect(card._id).to.not.exist
        expect(card.name).to.equal(name)
        expect(card.name).to.be.a('string')
        expect(card.description).to.equal(description)
        expect(card.description).to.be.a('string')
        expect(card.image).to.equal(image)
        expect(card.image).to.be.a('string')
        expect(card.price).to.equal(price)
        expect(card.price).to.be.a('number')
        expect(card.col.toString()).to.equal(col)
        expect(card.col.toString()).to.be.a('string')
        expect(card.effect).to.equal(effect)
        expect(card.effect).to.be.a('string')
        expect(card.effectValue).to.equal(effectValue)
        expect(card.effectValue).to.be.a('number')
        expect(card.target).to.equal(target)
        expect(card.target).to.be.a('string')
        
    })

    it('should fail on wrong card id', async () => {
        const id = '012345678901234567890123'

        try {
            await retrieveCard(id)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`card with id ${id} not found`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => retrieveCard(1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveCard(true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveCard([])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveCard({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveCard(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveCard(null)).to.throw(TypeError, 'null is not a string')
        expect(() => retrieveCard('wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => retrieveCard('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => retrieveCard(' \t\r')).to.throw(ContentError, 'id is empty or blank')
    })

    after(() => Card.deleteMany().then(database.disconnect))
})