require('dotenv').config()
const { env: { DB_URL_TEST } } = process
const { expect } = require('chai')
const createTask = require('.')
const { random } = Math
const { database, models: { User, Task } } = require('../../data')
const { ObjectId } = require ('mongodb')
const { ContentError, NotFoundError } = require('../../utils/errors')

describe('logic - create task', () => {
    
    before(() => database.connect(DB_URL_TEST))

    let id, name, surname, email, username, password, title, description

    beforeEach(() => {
        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        username = `username-${random()}`
        password = `password-${random()}`

        return Promise.all([User.deleteMany(), Task.deleteMany()])
            .then (() => User.create({ name, surname, email, username, password })
                .then(result => {
                    id = result.id

                    title = `title-${random()}`
                    description = `description-${random()}`
                }))


    })

    it('should succeed on correct user and task data', () =>
        createTask(id, title, description)
            .then(taskId => {
                expect(taskId).to.exist
                expect(taskId).to.be.a('string')
                expect(taskId).to.have.length.greaterThan(0)

                return Task.findOne({ _id: ObjectId(taskId) })
            })
            .then(task => {
                expect(task).to.exist
                expect(task.user.toString()).to.equal(id)
                expect(task.title).to.equal(title)
                expect(task.description).to.equal(description)
                expect(task.status).to.equal('TODO')
                expect(task.date).to.exist
                expect(task.date).to.be.instanceOf(Date)
            })
    )

    it("should fail wrong user Id", () =>
        createTask('wrong1234567', title, description)
            .then(() => {
                throw Error('should not reach this point')
            })
            .catch(error => {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)
                expect(error.message).to.equal(`user with id wrong1234567 not found`)
            })
    )

    it("should fail on invalid id", () =>
        expect(() => createTask('wrong', title, description).to.throw(ContentError, `wrong id: wrong must be a string of 12 length`))
    )

    it('should fail on incorrect id type and content', () => {
        expect(() => createTask(1)).to.throw(TypeError, '1 is not a string')
        expect(() => createTask(true)).to.throw(TypeError, 'true is not a string')
        expect(() => createTask([])).to.throw(TypeError, ' is not a string')
        expect(() => createTask({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => createTask(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => createTask(null)).to.throw(TypeError, 'null is not a string')

        expect(() => createTask('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => createTask(' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => createTask(id, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => createTask(id, true)).to.throw(TypeError, 'true is not a string')
        expect(() => createTask(id, [])).to.throw(TypeError, ' is not a string')
        expect(() => createTask(id, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => createTask(id, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => createTask(id, null)).to.throw(TypeError, 'null is not a string')

        expect(() => createTask(id, '')).to.throw(ContentError, 'title is empty or blank')
        expect(() => createTask(id, ' \t\r')).to.throw(ContentError, 'title is empty or blank')

        expect(() => createTask(id, title, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => createTask(id, title, true)).to.throw(TypeError, 'true is not a string')
        expect(() => createTask(id, title, [])).to.throw(TypeError, ' is not a string')
        expect(() => createTask(id, title, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => createTask(id, title, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => createTask(id, title, null)).to.throw(TypeError, 'null is not a string')

        expect(() => createTask(id, title, '')).to.throw(ContentError, 'description is empty or blank')
        expect(() => createTask(id, title, ' \t\r')).to.throw(ContentError, 'description is empty or blank')

    })

    after(() => Promise.all([User.deleteMany(), Task.deleteMany()]).then (() => database.disconnect()))
})