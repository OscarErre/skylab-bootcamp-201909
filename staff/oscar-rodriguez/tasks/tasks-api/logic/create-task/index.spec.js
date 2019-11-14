const { expect } = require('chai')
const tasks = require('../../data/tasks')('test')
const users = require('../../data/users')('test')
const createTask = require('.')
const { ContentError } = require('../../utils/errors')
const { random } = Math
const uuid = require('uuid/v4')


describe('logic - register user', () => {
    let userId, name, surname, email, username, password
    let title, description, status

    before(() => {
        tasks.load()
        users.load()

        userId = uuid()
        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        username = `username-${random()}`
        password = `password-${random()}`

        users.data.push({ id, name, surname, email, username, password })
    })

    /* 
        "id": "TODO calculate it with uuid",
        "user": "c1b7fcfa-deee-4a07-ae7b-8a7eb91847ca",
        "title": "blah blah blah",
        "description": "blah blah blah",
        "status": "TODO",
        "date": "2019-11-13T16:22:16.698Z"
    */

    beforeEach(() => {
        title = `title-${random()}`
        description = 'Nulla velit nulla amet do deserunt. Ut ipsum commodo culpa aute non officia adipisicing deserunt occaecat reprehenderit sunt exercitation exercitation'
        status = `TODO`
    })

    it('should succeed on correct credentials', () =>
        createTask(userId, title, description)
            .then(taskId => {
                expect(taskId).to.exist

                const task = tasks.data.find(task => task.id === taskId)

                expect(task).to.exist

                expect(task.title).to.equal(title)
                expect(task.userId).to.equal(userId)
                expect(task.email).to.equal(email)
                expect(task.taskname).to.equal(taskname)
                expect(task.password).to.equal(password)
            })
    )

    it('should fail on incorrect userId, title, description, status type and content', () => {
        expect(() => createTask(1)).to.throw(TypeError, '1 is not a string')
        expect(() => createTask(true)).to.throw(TypeError, 'true is not a string')
        expect(() => createTask([])).to.throw(TypeError, ' is not a string')
        expect(() => createTask({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => createTask(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => createTask(null)).to.throw(TypeError, 'null is not a string')

        expect(() => createTask('')).to.throw(ContentError, 'name is empty or blank')
        expect(() => createTask(' \t\r')).to.throw(ContentError, 'name is empty or blank')

        expect(() => createTask(userId, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => createTask(userId, true)).to.throw(TypeError, 'true is not a string')
        expect(() => createTask(userId, [])).to.throw(TypeError, ' is not a string')
        expect(() => createTask(userId, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => createTask(userId, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => createTask(userId, null)).to.throw(TypeError, 'null is not a string')

        expect(() => createTask(userId, '')).to.throw(ContentError, 'title is empty or blank')
        expect(() => createTask(userId, ' \t\r')).to.throw(ContentError, 'title is empty or blank')

        expect(() => createTask(name, title, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => createTask(name, title, true)).to.throw(TypeError, 'true is not a string')
        expect(() => createTask(name, title, [])).to.throw(TypeError, ' is not a string')
        expect(() => createTask(name, title, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => createTask(name, title, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => createTask(name, title, null)).to.throw(TypeError, 'null is not a string')

        expect(() => createTask(name, title, '')).to.throw(ContentError, 'description is empty or blank')
        expect(() => createTask(name, title, ' \t\r')).to.throw(ContentError, 'description is empty or blank')

    })

    // TODO other cases
})