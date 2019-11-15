const { expect } = require('chai')
const tasks = require('../../data/tasks')('test')
const users = require('../../data/users')('test')
const removeTask = require('.')
const { ContentError } = require('../../utils/errors')
const { random } = Math
const uuid = require('uuid/v4')


describe('logic - create Task', () => {
    let id, name, surname, email, username, password
    let taskId, title, description

    before(() => Promise.all ([tasks.load(), users.load()]))
    
    beforeEach(() => {
        id = uuid()
        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        username = `username-${random()}`
        password = `password-${random()}`
    
        users.data.push({ id, name, surname, email, username, password })

        taskId = uuid()
        title = `title-${random()}`
        description = 'Nulla velit nulla amet do deserunt. Ut ipsum commodo culpa aute non officia adipisicing deserunt occaecat reprehenderit sunt exercitation exercitation'
        tasks.data.push({ id: taskId, user: id, title, description })
    })

    it('should succeed on correct id', () =>
        removeTask(taskId)
            .then(response => {
                expect(response).to.not.exist

                const task = tasks.data.find(task => task.id === taskId)

                expect(task).to.not.exist
            })
    )

    it('should fail on wrong id', () =>
        removeTask(id)
            .then(() => {
                throw Error('should not reach this point')
            })
            .catch(error => {
                expect(error).to.exist
            })
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

    })

})