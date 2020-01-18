const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const retrieveCollectionCards = require('.')
const { random } = Math
const { errors: { NotFoundError, ContentError } } = require('baam-util')
const { database, ObjectId, models: { Card, Collection } } = require('baam-data')

describe('logic - retrieve collection cards', () => {

    beforeAll(() => database.connect(TEST_DB_URL))

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
                expect(cards).toBeDefined()
                expect(cards.length).toBe(5)

                cards.forEach(card => {
                    expect(card.id).toBeDefined()
                    expect(typeof card.id).toBe('string')
                    expect(card.id.length).toBeGreaterThan(0)
                    expect(cardIds).toContain(card.id)

                    expect(card.col).toBe(colName)

                    expect(card.name).toBeDefined()
                    expect(typeof card.name).toBe('string')
                    expect(card.name.length).toBeGreaterThan(0)
                    expect(names).toContain(card.name)

                    expect(card.description).toBeDefined()
                    expect(typeof card.description).toBe('string')
                    expect(card.description.length).toBeGreaterThan(0)
                    expect(descriptions).toContain(card.description)
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
                expect(error).toBeDefined()
                expect(error).toBeInstanceOf(NotFoundError)
                expect(error.message).toBe(`there are no cards on this collection`)
            })
    })

    it('should fail on incorrect type and content', () => {
        expect(() => retrieveCollectionCards(1)).toThrow(TypeError, '1 is not a string')
        expect(() => retrieveCollectionCards(true)).toThrow(TypeError, 'true is not a string')
        expect(() => retrieveCollectionCards([])).toThrow(TypeError, ' is not a string')
        expect(() => retrieveCollectionCards({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => retrieveCollectionCards(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => retrieveCollectionCards(null)).toThrow(TypeError, 'null is not a string')

        expect(() => retrieveCollectionCards('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => retrieveCollectionCards(' \t\r')).toThrow(ContentError, 'id is empty or blank')
    })

    afterAll(() => Promise.all([Card.deleteMany(), Collection.deleteMany()])
        .then(database.disconnect))
})