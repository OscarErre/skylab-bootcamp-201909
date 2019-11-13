const { expect } = require('chai')
const authenticateUser = require ('../authenticate-user')
const users = require ('../../data/users.json')
const fs = require('fs').promises
const path = require('path')

describe('logic - authenticate user', () => {
    let name, surname, email, username, password

    beforeEach(done => {
        name = `name-${Math.random()}`
        surname = `surname-${Math.random()}`
        email = `email-${Math.random()}@mail.com`
        username = `username-${Math.random()}`
        password = `password-${Math.random()}`

        users.push({ name, surname, email, username, password })
        fs.writeFile(path.join(__dirname, '../../data/users.json'), JSON.stringify(users))
            .then (done())
            .catch (error => done (new Error(error)))
    })

    it('should succeed on correct credentials', () => {
        return authenticateUser(username, password)
            .then(response => {
                expect(response).to.exist

                const { id, token } = response

                expect(id).to.exist
                expect(typeof id).to.equal('string')
                expect(id.length).to.be.greaterThan(0)

                expect(token).to.exist
                expect(typeof token).to.equal('string')
                expect(token.length).to.be.greaterThan(0)

        })
    })

    it('should fail on wrong credentials', () => {

        return authenticateUser(`wrong${username}`, password)
            .catch (error => {
                expect(error).to.exist
        })

    })
})