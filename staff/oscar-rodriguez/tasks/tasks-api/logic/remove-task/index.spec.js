const { expect } = require('chai')
require('dotenv').config()
const { env: { DB_URL_TEST } } = process
const removeTask = require('.')
const { NotFoundError, ContentError } = require('../../utils/errors')
const { random } = Math
const uuid = require('uuid/v4')
const database = require('../../utils/database')
const { ObjectId } = database
require('../../utils/array-random')


describe('logic - remove Task', () => {
    let client, users, tasks
    let id, name, surname, email, username, password
    let taskId, title, description, status, date

    before(() => {
        client = database(DB_URL_TEST)

        return client.connect()
            .then(connection => {
                const db = connection.db()

                users = db.collection('users')
                tasks = db.collection('tasks')
            })
    })

    beforeEach(() => {
        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        username = `username-${random()}`
        password = `password-${random()}`

        return users.insertOne({ name, surname, email, username, password })
            .then (result=> {
                id = result.insertedId.toString()

                title = `title-${random()}`
                description = `description-${random()}`
                status = ['TODO', 'DOING', 'REVIEW', 'DONE'].random()
                date = new Date

                return tasks.insertOne({ user: id, title, description, status, date})
                    .then ( result => {
                        taskId = result.insertedId.toString()
                    })
            })

    })

    it('should succeed on correct id', () =>
        removeTask(id, taskId)
            .then(response => {
                expect(response).to.not.exist

                return tasks.findOne({_id: ObjectId(taskId)})
            })
            .then (task => expect(task).to.not.exist)
    )

    it("should fail on valid id doesn't match any user", () =>
        removeTask('wrong1234567', taskId)
            .then(() => {
                throw Error('should not reach this point')
            })
            .catch(error => {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)
                expect(error.message).to.equal(`user with id wrong1234567 not found`)
            })
    )

    it("should fail on valid taskId doesn't match any task", () =>
        removeTask(id, 'wrong1234567')
            .then(() => {
                throw Error('should not reach this point')
            })
            .catch(error => {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)
                expect(error.message).to.equal(`task with id wrong1234567 does not matcht to this user`)
            })
    )


    it("should fail on invalid id", () =>
        expect (() => removeTask('wrong', taskId, newTitle, newDescription, newStatus).to.throw(ContentError, `wrong id: wrong must be a string of 12 length`))
    )

    it("should fail on invalid taskId", () =>
        expect (() => removeTask(id, 'wrong', newTitle, newDescription, newStatus).to.throw(ContentError, `wrong taskId: wrong must be a string of 12 length`))
    )

    it('should fail on incorrect id type and content', () => {
        expect(() => removeTask(1)).to.throw(TypeError, '1 is not a string')
        expect(() => removeTask(true)).to.throw(TypeError, 'true is not a string')
        expect(() => removeTask([])).to.throw(TypeError, ' is not a string')
        expect(() => removeTask({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => removeTask(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => removeTask(null)).to.throw(TypeError, 'null is not a string')

        expect(() => removeTask('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => removeTask(' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => removeTask(id, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => removeTask(id, true)).to.throw(TypeError, 'true is not a string')
        expect(() => removeTask(id, [])).to.throw(TypeError, ' is not a string')
        expect(() => removeTask(id, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => removeTask(id, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => removeTask(id, null)).to.throw(TypeError, 'null is not a string')
 
        expect(() => removeTask(id, '')).to.throw(ContentError, 'taskId is empty or blank')
        expect(() => removeTask(id, ' \t\r')).to.throw(ContentError, 'taskId is empty or blank')

    })

    after(() => client.close())
})