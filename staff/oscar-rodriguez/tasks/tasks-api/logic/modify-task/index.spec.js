require('dotenv').config()
const { env: { DB_URL_TEST } } = process
const { expect } = require('chai')
const modifyTask = require('.')
const { random } = Math
const uuid = require('uuid')
require('../../utils/array-random')
const { NotFoundError, ConflictError, ContentError } = require('../../utils/errors')
const database = require('../../utils/database')
const { ObjectId } = database


describe('logic - modify task', () => {

    let client, users, tasks
    before(() => {
        client = database(DB_URL_TEST)

        return client.connect()
            .then(connection => {
                const db = connection.db()

                tasks = db.collection('tasks')
                users = db.collection('users')
            })
    })

    const statuses = ['TODO', 'DOING', 'REVIEW', 'DONE']
    let id, name, surname, email, username, password, taskIds, titles, descriptions, docs

    beforeEach(() => {
        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        username = `username-${random()}`
        password = `password-${random()}`

        return users.insertOne({ name, surname, email, username, password })
            .then(result => {
                id = result.insertedId.toString()

                docs = []
                titles = []
                descriptions = []

                for (let i = 0; i < 5; i++) {
                    docs.push({
                        user: id,
                        title: `title-${random()}`,
                        description: `description-${random()}`,
                        status: statuses.random(),
                        date: new Date
                    })
                    titles.push(docs[i].title)
                    descriptions.push(docs[i].description)
                }

                for (let i = 0; i < 5; i++)
                    docs.push({
                        user: uuid(),
                        title: `title-${random()}`,
                        description: `description-${random()}`,
                        status: statuses.random(),
                        date: new Date
                    })

                return tasks.insertMany(docs)
                    .then(result => {
                        taskIds = []
                        result.ops.forEach(task => {
                            if (task.user === id) taskIds.push(task._id.toString())
                        })
                        //taskIds = result.insertedIds
                        // no devuelve un Array
                    })
            })
    })

    it('should succeed on correct user and task data', () => {
        const taskId = taskIds.random()
        const newTitle = `new-title-${random()}`
        const newDescription = `new-description-${random()}`
        const newStatus = statuses.random()
        const testStart = new Date

        return modifyTask(id, taskId, newTitle, newDescription, newStatus)
            .then(response => {
                expect(response).to.not.exist

                return tasks.findOne({ _id: ObjectId(taskId) })
                    .then(task => {
                        expect(task.user).to.equal(id)

                        expect(task.title).to.exist
                        expect(task.title).to.be.a('string')
                        expect(task.title).to.have.length.greaterThan(0)
                        expect(task.title).to.equal(newTitle)

                        expect(task.description).to.exist
                        expect(task.description).to.be.a('string')
                        expect(task.description).to.have.length.greaterThan(0)
                        expect(task.description).to.equal(newDescription)

                        expect(task.status).to.exist
                        expect(task.status).to.be.a('string')
                        expect(task.status).to.have.length.greaterThan(0)
                        expect(task.status).to.equal(newStatus)

                        expect(task.date).to.exist
                        expect(task.date).to.be.an.instanceOf(Date)

                        expect(task.lastAccess).to.exist
                        expect(task.lastAccess).to.be.an.instanceOf(Date)
                        expect(task.lastAccess).to.be.greaterThan(testStart)
                    })
            })
    })

    it('should succeed on correct user and new task data, except for title', () => {
        const taskId = taskIds.random()
        let title
        return tasks.findOne({_id: ObjectId(taskId)})
        .then (task=>{
            title = task.title
        })
        .then (()=> {
                const newDescription = `new-description-${random()}`
                const newStatus = statuses.random()
                const testStart = new Date
        
                return modifyTask(id, taskId, undefined, newDescription, newStatus)
                    .then(response => {
                        expect(response).to.not.exist
        
                        return tasks.findOne({_id: ObjectId(taskId)})
                            .then (task=>{
        
                            expect(task.user).to.equal(id)
            
                            expect(task.title).to.exist
                            expect(task.title).to.be.a('string')
                            expect(task.title).to.have.length.greaterThan(0)
                            expect(task.title).to.equal(title)
            
                            expect(task.description).to.exist
                            expect(task.description).to.be.a('string')
                            expect(task.description).to.have.length.greaterThan(0)
                            expect(task.description).to.equal(newDescription)
            
                            expect(task.status).to.exist
                            expect(task.status).to.be.a('string')
                            expect(task.status).to.have.length.greaterThan(0)
                            expect(task.status).to.equal(newStatus)
            
                            expect(task.date).to.exist
                            expect(task.date).to.be.an.instanceOf(Date)
            
                            expect(task.lastAccess).to.exist
                            expect(task.lastAccess).to.be.an.instanceOf(Date)
                            expect(task.lastAccess).to.be.greaterThan(testStart)
                    })
                })

            })
    })

    it('should succeed on correct user and new task data, except for description', () => {
        const taskId = taskIds.random()
        let description
        return tasks.findOne({_id: ObjectId(taskId)})
        .then (task=>{
            description = task.description
        })
        .then (()=> {
            const newTitle = `new-title-${random()}`
            const newStatus = statuses.random()
            const testStart = new Date
            return modifyTask(id, taskId, newTitle, undefined, newStatus)
                .then(response => {
                    expect(response).to.not.exist

                    return tasks.findOne({_id: ObjectId(taskId)})
                        .then (task=>{
                            expect(task.user).to.equal(id)

                            expect(task.title).to.exist
                            expect(task.title).to.be.a('string')
                            expect(task.title).to.have.length.greaterThan(0)
                            expect(task.title).to.equal(newTitle)

                            expect(task.description).to.exist
                            expect(task.description).to.be.a('string')
                            expect(task.description).to.have.length.greaterThan(0)
                            expect(task.description).to.equal(description)

                            expect(task.status).to.exist
                            expect(task.status).to.be.a('string')
                            expect(task.status).to.have.length.greaterThan(0)
                            expect(task.status).to.equal(newStatus)

                            expect(task.date).to.exist
                            expect(task.date).to.be.an.instanceOf(Date)

                            expect(task.lastAccess).to.exist
                            expect(task.lastAccess).to.be.an.instanceOf(Date)
                            expect(task.lastAccess).to.be.greaterThan(testStart)
                        })
                })
        })
    })

    it('should succeed on correct user and new task data, except for status', () => {
        const taskId = taskIds.random()
        let status
        return tasks.findOne({_id: ObjectId(taskId)})
        .then (task=>{
            status = task.status
        })
        .then (()=> {
            const newTitle = `new-title-${random()}`
            const newDescription = `new-description-${random()}`
            const testStart = new Date

            return modifyTask(id, taskId, newTitle, newDescription, undefined)
                .then(response => {
                    expect(response).to.not.exist

                    return tasks.findOne({_id: ObjectId(taskId)})
                        .then (task =>{
                            expect(task.user).to.equal(id)
        
                            expect(task.title).to.exist
                            expect(task.title).to.be.a('string')
                            expect(task.title).to.have.length.greaterThan(0)
                            expect(task.title).to.equal(newTitle)
        
                            expect(task.description).to.exist
                            expect(task.description).to.be.a('string')
                            expect(task.description).to.have.length.greaterThan(0)
                            expect(task.description).to.equal(newDescription)
        
                            expect(task.status).to.exist
                            expect(task.status).to.be.a('string')
                            expect(task.status).to.have.length.greaterThan(0)
                            expect(task.status).to.equal(status)
        
                            expect(task.date).to.exist
                            expect(task.date).to.be.an.instanceOf(Date)
        
                            expect(task.lastAccess).to.exist
                            expect(task.lastAccess).to.be.an.instanceOf(Date)
                            expect(task.lastAccess).to.be.greaterThan(testStart)
                        })
                })
        })
    })

    it('should fail on unexisting user and correct task data', () => {
        const id = 'wrong1234567'
        const taskId = taskIds.random()
        const newTitle = `new-title-${random()}`
        const newDescription = `new-description-${random()}`
        const newStatus = statuses.random()

        return modifyTask(id, taskId, newTitle, newDescription, newStatus)
            .then(() => { throw new Error('should not reach this point') })
            .catch(error => {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)
                expect(error.message).to.equal(`user with id ${id} not found`)
            })
    })

    it('should fail on correct user and unexisting task data', () => {
        const taskId = 'wrong1234567'
        const newTitle = `new-title-${random()}`
        const newDescription = `new-description-${random()}`
        const newStatus = statuses.random()

        return modifyTask(id, taskId, newTitle, newDescription, newStatus)
            .then(() => { throw new Error('should not reach this point') })
            .catch(error => {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)
                expect(error.message).to.equal(`user does not have task with id ${taskId}`)
            })
    })


    it('should fail on correct user and wrong task status', () => {
        const taskId = taskIds.random()
        const newTitle = `new-title-${random()}`
        const newDescription = `new-description-${random()}`
        const newStatus = 'wrong-status'

        expect(() => modifyTask(id, taskId, newTitle, newDescription, newStatus)).to.throw(ContentError, `${newStatus} does not match any of the valid status values: ${statuses}`)
    })

    it('should fail on incorrect ids, title, description, status type and content', () => {
        const taskId = taskIds.random()
        const title = `new-title-${random()}`
        const description = `new-description-${random()}`

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
        expect(() => modifyTask(id, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => modifyTask(id, null)).to.throw(TypeError, 'null is not a string')

        expect(() => modifyTask(id, '')).to.throw(ContentError, 'taskId is empty or blank')
        expect(() => modifyTask(id, ' \t\r')).to.throw(ContentError, 'taskId is empty or blank')

        expect(() => modifyTask(id, taskId, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyTask(id, taskId, true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyTask(id, taskId, [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyTask(id, taskId, {})).to.throw(TypeError, '[object Object] is not a string')

        expect(() => modifyTask(id, taskId, title, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyTask(id, taskId, title, true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyTask(id, taskId, title, [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyTask(id, taskId, title, {})).to.throw(TypeError, '[object Object] is not a string')

        expect(() => modifyTask(id, taskId, title, description, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyTask(id, taskId, title, description, true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyTask(id, taskId, title, description, [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyTask(id, taskId, title, description, {})).to.throw(TypeError, '[object Object] is not a string')
    })

    after(() => client.close())
})