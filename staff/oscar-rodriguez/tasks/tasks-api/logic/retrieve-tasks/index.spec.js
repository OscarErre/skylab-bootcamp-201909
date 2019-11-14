const { expect } = require('chai')
const { random } = Math
const users = require('../../data/users')('test')
const tasks = require('../../data/tasks')('test')
const retrieveTasks = require('.')
const uuid = require('uuid/v4')
const { NotFoundError } = require('../../utils/errors')

describe('logic - retrieve tasks', () => {
    before(() => Promise.all([users.load(), tasks.load()]))

    let id, name, surname, email, username, password, taskId, title, description, status

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
        status = 'TODO'
        date = new Date()
        tasks.data.push({ id: taskId, title, description, status, date })
    })

    it('should succeed on correct user id', () =>
        retrieveTasks(id)
            .then(tasks => {
                expect(tasks).to.exist
                expect(tasks).to.be.an.instanceOf(Array)
                tasks.forEach (task => {
                    expect(task.id).to.equal(taskId)
                    expect(task.title).to.equal(title)
                    expect(task.description).to.equal(description)
                    expect(task.status).to.equal(status)
                    expect(task.date).to.equal(date)
                })
            })
    )

    it('should fail on wrong user id', () => {
        const id = 'wrong'

        return retrieveTasks(id)
            .then(() => {
                throw Error('should not reach this point')
            })
            .catch(error => {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)
                expect(error.message).to.equal(`user with id ${id} not found`)
            })
    })

})