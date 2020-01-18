require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const retrieveUserCards = require('.')
const { errors: { NotFoundError, ContentError } } = require('baam-util')
const { ObjectId, database, models: { Card, User } } = require('baam-data')

describe('logic - retrieve user Cards', () => {
    before(() => database.connect(TEST_DB_URL))

    let id, name, description, image, price, col, effect, effectValue, target

    beforeEach(async () => {
        await Promise.all([Card.deleteMany()],User.deleteMany())

        let name = `name-${random()}`
        let surname = `surname-${random()}`
        let email = `email-${random()}@mail.com`
        let nickname = `nickname-${random()}`
        let password = `password-${random()}`

        const user = await User.create({ name, surname, email, nickname, password })

        id = user.id

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

            i<5 && user.cards.push (card.id)
        }
        await user.save()

    })

    it('should succeed on correct user id', async () => {
        const cards = await retrieveUserCards(id)

        expect(cards).to.exist
        expect(cards.length).to.equal(5)

        cards.forEach(card=> {
            expect(card.id).to.be.a('string')
            expect(card._id).to.not.exist
            expect(card.name).to.be.a('string')
            expect(card.description).to.be.a('string')
            expect(card.image).to.be.a('string')
            expect(card.price).to.be.a('number')
            expect(card.col.toString()).to.be.a('string')
            expect(card.effect).to.be.a('string')
            expect(card.effectValue).to.be.a('number')
            expect(card.target).to.be.a('string')
        })
        
    })

    it('should fail on wrong user id', async () => {
        const id = '012345678901234567890123'

        try {
            await retrieveUserCards(id)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${id} not found`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => retrieveUserCards(1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveUserCards(true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveUserCards([])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveUserCards({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveUserCards(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveUserCards(null)).to.throw(TypeError, 'null is not a string')
        expect(() => retrieveUserCards('wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => retrieveUserCards('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => retrieveUserCards(' \t\r')).to.throw(ContentError, 'id is empty or blank')
    })

    after(() => Card.deleteMany().then(database.disconnect))
})