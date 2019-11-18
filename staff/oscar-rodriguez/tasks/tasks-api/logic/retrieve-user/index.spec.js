require('dotenv').config()
const { env: { DB_URL_TEST } } = process
const { expect } = require('chai')
const { random } = Math
const retrieveUser = require('.')
const { NotFoundError, ContentError} = require('../../utils/errors')
const database = require('../../utils/database')

describe('logic - retrieve user', () => {
    let client, users

    before(() => {
        client = database(DB_URL_TEST)

        return client.connect()
            .then(connection => users = connection.db().collection('users'))
    })

    let id, name, surname, email, username, password

    beforeEach(() => {
        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        username = `username-${random()}`
        password = `password-${random()}`

        return users.insertOne({ name, surname, email, username, password })
            .then(result => {
                id = result.insertedId.toString()
            })
    })

    it('should succeed on correct user id', () =>
        retrieveUser(id)
            .then(user => {
                expect(user).to.exist
                expect(user.id).to.equal(id)
                expect(user.name).to.equal(name)
                expect(user.surname).to.equal(surname)
                expect(user.email).to.equal(email)
                expect(user.username).to.equal(username)
                expect(user.password).to.be.undefined
            })
    )

    it("should fail on a valid id that doesn't correspond any user", () => {
        const id = 'wrong1234567'

        return retrieveUser(id)
            .then(() => {
                throw Error('should not reach this point')
            })
            .catch(error => {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)
                expect(error.message).to.equal(`user with id ${id} not found`)
            })
    })

    it("should fail on invalid id", () =>
        expect (() => retrieveUser('wrong').to.throw(ContentError, `wrong id: wrong must be a string of 12 length`))
    )

    it('should fail on incorrect type and content', () => {
        expect(() => retrieveUser(1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveUser(true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveUser([])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveUser({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveUser(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveUser(null)).to.throw(TypeError, 'null is not a string')

        expect(() => retrieveUser('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => retrieveUser(' \t\r')).to.throw(ContentError, 'id is empty or blank')
    })

    after (()=> client.close())
})