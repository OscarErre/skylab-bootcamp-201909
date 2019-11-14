const { expect } = require('chai')
const tasks = require('../../data/tasks')('test')
const users = require('../../data/users')('test')
const createTask = require('.')
const { ContentError } = require('../../utils/errors')
const { random } = Math
const uuid = require('uuid/v4')


describe('logic - create Task', () => {
    let id, name, surname, email, username, password
    let title, description

    before(() => Promise.all ([tasks.load(), users.load()]))
    
    beforeEach(() => {
        id = uuid()
        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        username = `username-${random()}`
        password = `password-${random()}`
    
        users.data.push({ id, name, surname, email, username, password })

        title = `title-${random()}`
        description = 'Nulla velit nulla amet do deserunt. Ut ipsum commodo culpa aute non officia adipisicing deserunt occaecat reprehenderit sunt exercitation exercitation'
    })

    it('should succeed on correct credentials', () =>
        createTask(id, title, description)
            .then(taskId => {
                expect(taskId).to.exist

                const task = tasks.data.find(task => task.id === taskId)

                expect(task).to.exist

                expect(task).to.exist
                expect(task.user).to.equal(id)
                expect(task.title).to.equal(title)
                expect(task.description).to.equal(description)
                expect(task.status).to.equal('TODO')
                expect(task.date).to.exist
                expect(task.date).to.be.instanceOf(Date)
            })
    )

    it('should fail on incorrect id, title, description, status type and content', () => {
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

        expect(() => createTask(name, title, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => createTask(name, title, true)).to.throw(TypeError, 'true is not a string')
        expect(() => createTask(name, title, [])).to.throw(TypeError, ' is not a string')
        expect(() => createTask(name, title, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => createTask(name, title, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => createTask(name, title, null)).to.throw(TypeError, 'null is not a string')

        expect(() => createTask(name, title, '')).to.throw(ContentError, 'description is empty or blank')
        expect(() => createTask(name, title, ' \t\r')).to.throw(ContentError, 'description is empty or blank')

    })

})