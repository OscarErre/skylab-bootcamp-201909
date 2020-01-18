require('dotenv').config()
const { env: { TEST_DB_URL: TEST_DB_URL } } = process
const { expect } = require('chai')
const retrieveCollectionCards = require('.')
const { random } = Math
/* const { database, ObjectId, models: { Card } } = require('../../data')
const { ContentError, NotFoundError } = require('../../utils/errors') */
const { errors: { NotFoundError, ContentError } } = require('../../../baam-util')
const { database, ObjectId, models: { Card, Collection } } = require('../../../baam-data')

describe('logic - retrieve collection cards', () => {

    before(() => database.connect(TEST_DB_URL))

    let id, colName

    let docs, names, descriptions, cardIds

    beforeEach(async () => {

        await Promise.all([Card.deleteMany(), Collection.deleteMany()])

        docs = []
        names = []
        descriptions = []
        colName = `collection-${random()}`

        const col = await Collection.create({name: colName})

        id = col._id.toString()
        for (let i = 0; i < 5; i++) {
            docs.push({
                name : `name-${random()}`,
                description : `description-${random()}`,
                image : `image-${random()}`,
                col: id.toString(),
                price : random(),
                effect : `effect-${random()}`,
                effectValue : random(),
                target : `target-${random()}`
            })
            names.push(docs[i].name)
            descriptions.push(docs[i].description)
        }

        for (let i = 0; i < 5; i++)
            docs.push({
                name : `name-${random()}`,
                description : `description-${random()}`,
                image : `image-${random()}`,
                col : ObjectId().toString(),
                price : random(),
                effect : `effect-${random()}`,
                effectValue : random(),
                target : `target-${random()}`
            })
        return Card.insertMany(docs)
            .then(result => {
                cardIds = []
                result.forEach(card =>
                    cardIds.push(card.id)
                )
            })
    })

    it('should succeed on correct user', () =>
        retrieveCollectionCards(id)
            .then(cards => {
                expect(cards).to.exist
                expect(cards).to.have.lengthOf(5)

                cards.forEach(card => {
                    expect(card.id).to.exist
                    expect(card.id).to.be.a('string')
                    expect(card.id).to.have.length.greaterThan(0)
                    expect(card.id).to.be.oneOf(cardIds)

                    expect(card.col).to.equal(colName)

                    expect(card.name).to.exist
                    expect(card.name).to.be.a('string')
                    expect(card.name).to.have.length.greaterThan(0)
                    expect(card.name).to.be.oneOf(names)

                    expect(card.description).to.exist
                    expect(card.description).to.be.a('string')
                    expect(card.description).to.have.length.greaterThan(0)
                    expect(card.description).to.be.oneOf(descriptions)
                })
            })
    )

    it("should fail on a valid id that doesn't correspond any user", () => {
        const id = 'wrong1234567'

        return retrieveCollectionCards(id)
            .then(() => {
                throw Error('should not reach this point')
            })
            .catch(error => {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)
                expect(error.message).to.equal(`there are no cards on this collection`)
            })
    })

    it('should fail on incorrect type and content', () => {
        expect(() => retrieveCollectionCards(1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveCollectionCards(true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveCollectionCards([])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveCollectionCards({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveCollectionCards(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveCollectionCards(null)).to.throw(TypeError, 'null is not a string')
        expect(() => retrieveCollectionCards('wrong')).to.throw(ContentError, `wrong is not a valid id`)

        expect(() => retrieveCollectionCards('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => retrieveCollectionCards(' \t\r')).to.throw(ContentError, 'id is empty or blank')
    })

    after(() => Promise.all([Card.deleteMany(), Collection.deleteMany()])
        .then(database.disconnect))
})