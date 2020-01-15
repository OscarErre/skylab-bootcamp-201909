const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const TEST_SECRET = process.env.REACT_APP_TEST_SECRET
const { random } = Math
const retrieveUser = require('.')
const { errors: { NotFoundError, ContentError } } = require('baam-util')
const { database, models: { User } } = require('baam-data')
const jwt = require ('jsonwebtoken')

describe('logic - retrieve user', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let id, token, name, surname, email, nickname, password

    beforeEach(async () => {
        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        nickname = `nickname-${random()}`
        password = `password-${random()}`

        await User.deleteMany()

        const user = await User.create({ name, surname, email, nickname, password })

        id = user.id

        token = jwt.sign({sub: id}, TEST_SECRET)
    })

    it('should succeed on correct user id', async () => {
        const user = await retrieveUser(token)

        expect(user).toBeDefined()
        expect(user.id).toEqual(id)
        expect(typeof user.id).toBe('string')
        expect(user._id).toBeUndefined()
        expect(user.name).toEqual(name)
        expect(typeof user.name).toBe('string')
        expect(user.surname).toEqual(surname)
        expect(typeof user.surname).toBe('string')
        expect(user.email).toEqual(email)
        expect(typeof user.email).toBe('string')
        expect(user.nickname).toEqual(nickname)
        expect(typeof user.nickname).toBe('string')
        expect(user.password).toBeUndefined()
        expect(user.lastAccess).toBeDefined()
        expect(user.lastAccess).toBeInstanceOf(Date)
    })

    it('should fail on wrong user id', async () => {
        const id = '012345678901234567890123'

        const token = jwt.sign({ sub: id }, TEST_SECRET)

        try {
            await retrieveUser(token)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toEqual(`user with id ${id} not found`)
        }
    })

    it('should fail on incorrect type and content', () => {
        expect(() => retrieveUser(1)).toThrow(TypeError, '1 is not a string')
        expect(() => retrieveUser(true)).toThrow(TypeError, 'true is not a string')
        expect(() => retrieveUser([])).toThrow(TypeError, ' is not a string')
        expect(() => retrieveUser({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => retrieveUser(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => retrieveUser(null)).toThrow(TypeError, 'null is not a string')

        expect(() => retrieveUser('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => retrieveUser(' \t\r')).toThrow(ContentError, 'id is empty or blank')
    })

    afterAll(() => User.deleteMany().then(database.disconnect))
})
