const { expect } = require('chai')
const users = require('../../data/users')('test')
const tasks = require('../../data/tasks')('test')
const modifyTask = require('.')
const { random, floor } = Math
const uuid = require('uuid')
const { ContentError } = require('../../utils/errors')

describe('logic - modify task', () => {
    before(() => Promise.all([users.load(), tasks.load()]))

    let id, name, surname, email, username, password, taskIds, title, description

    beforeEach(() => {
        id = uuid()
        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        username = `username-${random()}`
        password = `password-${random()}`

        users.data.push({ id, name, surname, email, username, password })

        taskIds = []

        for (let i = 0; i < 5; i++) {
            const task = {
                id: uuid(),
                user: id,
                title: `title-${random()}`,
                description: `description-${random()}`,
                status: 'REVIEW',
                date: new Date
            }

            tasks.data.push(task)
            taskIds.push(task.id)
        }
    })


    it('should succed on modify a property of a correct id', () => {
        let testId = taskIds[floor(random() * taskIds.length)]

        let testTask = tasks.data.find(task => task.id === testId)

        return modifyTask(testId, "TEST_TITLE")
            .then(() => {
                const task = tasks.data.find(task => task.id === testId)
                expect(task.title).to.be.equal("TEST_TITLE")
                expect(task.description).to.be.equal(testTask.description)
                expect(task.status).to.be.equal(testTask.status)
           
                testId = taskIds[floor(random() * taskIds.length)]
                testTask = tasks.data.find(task => task.id === testId)

                return modifyTask(testId, undefined, "Anim sint culpa et aute ipsum tempor exercitation aliqua amet aute.")
                    .then(() => {
                        const task = tasks.data.find(task => task.id === testId)
                        expect(task.description).to.be.equal("Anim sint culpa et aute ipsum tempor exercitation aliqua amet aute.")
                        expect(task.title).to.be.equal(testTask.title)
                        expect(task.status).to.be.equal(testTask.status)

                        testId = taskIds[floor(random() * taskIds.length)]
                        testTask = tasks.data.find(task => task.id === testId)
                        
                        return modifyTask(testId, undefined, undefined, "DONE")
                            .then(() => {
                                const task = tasks.data.find(task => task.id === testId)
                                expect(task.status).to.be.equal("DONE")
                                expect(task.title).to.be.equal(testTask.title)
                                expect(task.description).to.be.equal(testTask.description)
                            })
                    })
            })
    })

    it('should fail on wrong id', () =>
        modifyTask('wrong')
            .then(() => {
                throw Error('should not reach this point')
            })
            .catch(error => {
                expect(error).to.exist
            })
    )

    it('should fail on incorrect id, title, description, status type and content', () => {
        expect(() => modifyTask(1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyTask(true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyTask([])).to.throw(TypeError, ' is not a string')
        expect(() => modifyTask({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => modifyTask(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => modifyTask(null)).to.throw(TypeError, 'null is not a string')

        expect(() => modifyTask('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => modifyTask(' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => modifyTask(id, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyTask(id, true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyTask(id, [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyTask(id, {})).to.throw(TypeError, '[object Object] is not a string')
        //expect(() => modifyTask(id, null)).to.throw(TypeError, 'null is not a string')

        expect(() => modifyTask(id, title, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyTask(id, title, true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyTask(id, title, [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyTask(id, title, {})).to.throw(TypeError, '[object Object] is not a string')
        //expect(() => modifyTask(id, title, null)).to.throw(TypeError, 'null is not a string')

        expect(() => modifyTask(id, title, description, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyTask(id, title, description, true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyTask(id, title, description, [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyTask(id, title, description, {})).to.throw(TypeError, '[object Object] is not a string')
        //expect(() => modifyTask(id, title, description, null)).to.throw(TypeError, 'null is not a string')
    })
})