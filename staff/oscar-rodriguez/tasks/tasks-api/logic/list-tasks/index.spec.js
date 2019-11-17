require('dotenv').config()
const { env: { DB_URL_TEST } } = process
const { expect } = require('chai')
const listTasks = require('.')
const { random } = Math
const uuid = require('uuid')
const database = require('../../utils/database')
const { ContentError, NotFoundError } = require ('../../utils/errors')

describe('logic - list tasks', () => {
    let client, users, tasks

    before(() => {
        client = database(DB_URL_TEST)

        return client.connect()
            .then(connection => {
                users = connection.db().collection('users')
                tasks = connection.db().collection('tasks')
            })
    })

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
                        status: 'DOING',
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
                        status: 'REVIEW',
                        date: new Date
                    })
                return tasks.insertMany(docs)
                    .then(result => {
                        taskIds = []
                        result.ops.forEach(task => {
                            taskIds.push(task._id.toString())
                        })
                        //taskIds = result.insertedIds
                        // no devuelve un Array
                    })

            })

    })

    it('should succeed on correct user', () =>
        listTasks(id)
            .then(tasks => {
                expect(tasks).to.exist
                expect(tasks).to.have.lengthOf(5)

                tasks.forEach(task => {
                    expect(task.id).to.exist
                    expect(task.id).to.be.a('string')
                    expect(task.id).to.have.length.greaterThan(0)
                    expect(task.id).be.oneOf(taskIds)

                    expect(task.user).to.equal(id)

                    expect(task.title).to.exist
                    expect(task.title).to.be.a('string')
                    expect(task.title).to.have.length.greaterThan(0)
                    expect(task.title).be.oneOf(titles)

                    expect(task.description).to.exist
                    expect(task.description).to.be.a('string')
                    expect(task.description).to.have.length.greaterThan(0)
                    expect(task.description).be.oneOf(descriptions)

                    expect(task.lastAccess).to.exist
                    expect(task.lastAccess).to.be.an.instanceOf(Date)
                })
            })
    )

    it("should fail on a valid id that doesn't correspond any user", () => {
        const id = 'wrong1234567'

        return listTasks(id)
            .then(() => {
                throw Error('should not reach this point')
            })
            .catch(error => {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)
                expect(error.message).to.equal(`user with id ${id} not found`)
            })
    })

    it("should fail on a invalid id", () => {
        const id = 'wrong'

        return listTasks(id)
            .then(() => {
                throw Error('should not reach this point')
            })
            .catch(error => {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(ContentError)
                expect(error.message).to.equal(`wrong id: ${id} must be a string of 12 length`)
            })
    })

    it('should fail on incorrect type and content', () => {
        expect(() => listTasks(1)).to.throw(TypeError, '1 is not a string')
        expect(() => listTasks(true)).to.throw(TypeError, 'true is not a string')
        expect(() => listTasks([])).to.throw(TypeError, ' is not a string')
        expect(() => listTasks({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => listTasks(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => listTasks(null)).to.throw(TypeError, 'null is not a string')

        expect(() => listTasks('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => listTasks(' \t\r')).to.throw(ContentError, 'id is empty or blank')
    })

    after(() => client.close())

})