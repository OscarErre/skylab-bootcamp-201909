const { expect } = require('chai')
const authenticateUser = require('../authenticate-user')
const users = require('../../data/users/index')
const { ContentError, CredentialsError } = require('../../utils/errors')
const uuid = require('uuid/v4')

describe('logic - authenticate user', () => {
    let id, name, surname, email, username, password

    beforeEach(() => {
        id = uuid()
        name = `name-${Math.random()}`
        surname = `surname-${Math.random()}`
        email = `email-${Math.random()}@mail.com`
        username = `username-${Math.random()}`
        password = `password-${Math.random()}`

        users.push({ id, name, surname, email, username, password })   
    })

    it('should succeed on correct credentials', () => {
        return authenticateUser(username, password)
            .then(_id => {
                expect(_id).to.exist

                expect(_id).to.exist
                expect(typeof _id).to.equal('string')
                expect(_id.length).to.be.greaterThan(0)
            })
    })

    it('should create lastAccess', () => {
        return authenticateUser (username, password)
            .then (_id => {
                const user = users.find (user=>user.id === _id)

                expect (user.lastAccess).to.exist
                expect (user.lastAccess).to.be.an.instanceOf(Date)
            })
    })

    describe('when wrong credentials', () => {
        it('should fail on wrong username', () => {
            const username = 'wrong'

            return authenticateUser(username, password)
                .then(() => { throw new Error('should not reach this point') })
                .catch(error => {
                    expect(error).to.exist
                    expect(error).to.be.an.instanceOf(CredentialsError)

                    const { message } = error
                    expect(message).to.equal(`wrong credentials, incorrect username or password`)
                })
        })

        it('should fail on wrong password', () => {
            const password = 'wrong'

            return authenticateUser(username, password)
                .then(() => { throw new Error('should not reach this point') })
                .catch(error => {
                    expect(error).to.exist
                    expect(error).to.be.an.instanceOf(CredentialsError)

                    const { message } = error
                    expect(message).to.equal(`wrong credentials, incorrect username or password`)
                })
        })
    })

    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {
        expect(() => authenticateUser(1)).to.throw(TypeError, '1 is not a string')
        expect(() => authenticateUser(true)).to.throw(TypeError, 'true is not a string')
        expect(() => authenticateUser([])).to.throw(TypeError, ' is not a string')
        expect(() => authenticateUser({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => authenticateUser(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => authenticateUser(null)).to.throw(TypeError, 'null is not a string')

        expect(() => authenticateUser('')).to.throw(ContentError, 'username is empty or blank')
        expect(() => authenticateUser(' \t\r')).to.throw(ContentError, 'username is empty or blank')

        expect(() => authenticateUser(email, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => authenticateUser(email, true)).to.throw(TypeError, 'true is not a string')
        expect(() => authenticateUser(email, [])).to.throw(TypeError, ' is not a string')
        expect(() => authenticateUser(email, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => authenticateUser(email, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => authenticateUser(email, null)).to.throw(TypeError, 'null is not a string')

        expect(() => authenticateUser(email, '')).to.throw(ContentError, 'password is empty or blank')
        expect(() => authenticateUser(email, ' \t\r')).to.throw(ContentError, 'password is empty or blank')
    })
})