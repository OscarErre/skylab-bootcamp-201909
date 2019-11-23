const { env: { REACT_APP_DB_URL_TEST : DB_URL_TEST, REACT_APP_TEST_SECRET: SECRET } } = process
const { random } = Math
const retrieveUser = require('.')
const { errors: { NotFoundError } } = require('tasks-util')
const { database, models: { User } } = require('tasks-data')
const jwt = require('jsonwebtoken')

describe('logic - retrieve user', () => {
    beforeAll(() => database.connect(DB_URL_TEST))

    let id, token, name, surname, email, username, password

    beforeEach(async () => {
        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        username = `username-${random()}`
        password = `password-${random()}`

        await User.deleteMany()

        const user = await User.create({ name, surname, email, username, password })

        id = user.id
        token = jwt.sign({ sub: id }, SECRET)
    })

    it('should succeed on correct user id', async () => {
        const user = await retrieveUser(token)

        expect(user).toBeDefined()
        expect(user.id).toBe(id)
        expect(user._id).toBeUndefined()
        expect(user.name).toBe(name)
        expect(user.surname).toBe(surname)
        expect(user.email).toBe(email)
        expect(user.username).toBe(username)
        expect(user.password).toBeUndefined()
    })

    it('should fail on wrong user id', async () => {
        const id = '012345678901234567890123'
        token =jwt.sign({ sub: id }, SECRET)

        try {
            await retrieveUser(token)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user with id ${id} not found`)
        }
    })

    afterAll(() => User.deleteMany().then(database.disconnect))
})