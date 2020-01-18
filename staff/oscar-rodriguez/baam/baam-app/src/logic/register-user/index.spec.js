const TEST_DB_URL = process.env.REACT_APP_TEST_DB_URL
const registerUser = require('.')
const { random } = Math
const { errors: { ContentError } } = require('baam-util')
const { database, models: { User } } = require('baam-data')

describe('logic - register user', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let name, surname, email, nickname, password

    beforeEach(() => {
        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        nickname = `nickname-${random()}`
        password = `password-${random()}`

        return User.deleteMany()
    })

    it('should succeed on correct credentials', async () => {
        const response = await registerUser(name, surname, email, nickname, password)

        expect(response).toBeUndefined()

        const user = await User.findOne({ nickname })

        expect(user).toBeDefined()

        expect(user.name).toEqual(name)
        expect(user.surname).toEqual(surname)
        expect(user.email).toEqual(email)
        expect(user.nickname).toEqual(nickname)
        expect(user.password).toEqual(password)
    })

    describe('when user already exists', () => {
        beforeEach(() => User.create({ name, surname, email, nickname, password }))

        it('should fail on already existing user', async () => {
            try {
                await registerUser(name, surname, email, nickname, password)

                throw Error('should not reach this point')
            } catch (error) {
                expect(error).toBeDefined()

                expect(error.message).toBeDefined()
                expect(typeof error.message).toEqual('string')
                expect(error.message.length).toBeGreaterThan(0)
                expect(error.message).toEqual(`user with nickname ${nickname} already exists`)
            }
        })
    })

    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {
        expect(() => registerUser(1)).toThrow(TypeError, '1 is not a string')
        expect(() => registerUser(true)).toThrow(TypeError, 'true is not a string')
        expect(() => registerUser([])).toThrow(TypeError, ' is not a string')
        expect(() => registerUser({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => registerUser(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => registerUser(null)).toThrow(TypeError, 'null is not a string')

        expect(() => registerUser('')).toThrow(ContentError, 'name is empty or blank')
        expect(() => registerUser(' \t\r')).toThrow(ContentError, 'name is empty or blank')

        expect(() => registerUser(name, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => registerUser(name, true)).toThrow(TypeError, 'true is not a string')
        expect(() => registerUser(name, [])).toThrow(TypeError, ' is not a string')
        expect(() => registerUser(name, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => registerUser(name, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => registerUser(name, null)).toThrow(TypeError, 'null is not a string')

        expect(() => registerUser(name, '')).toThrow(ContentError, 'surname is empty or blank')
        expect(() => registerUser(name, ' \t\r')).toThrow(ContentError, 'surname is empty or blank')

        expect(() => registerUser(name, surname, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => registerUser(name, surname, true)).toThrow(TypeError, 'true is not a string')
        expect(() => registerUser(name, surname, [])).toThrow(TypeError, ' is not a string')
        expect(() => registerUser(name, surname, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => registerUser(name, surname, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => registerUser(name, surname, null)).toThrow(TypeError, 'null is not a string')

        expect(() => registerUser(name, surname, '')).toThrow(ContentError, 'e-mail is empty or blank')
        expect(() => registerUser(name, surname, ' \t\r')).toThrow(ContentError, 'e-mail is empty or blank')

        expect(() => registerUser(name, surname, email, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => registerUser(name, surname, email, true)).toThrow(TypeError, 'true is not a string')
        expect(() => registerUser(name, surname, email, [])).toThrow(TypeError, ' is not a string')
        expect(() => registerUser(name, surname, email, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => registerUser(name, surname, email, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => registerUser(name, surname, email, null)).toThrow(TypeError, 'null is not a string')

        expect(() => registerUser(name, surname, email, '')).toThrow(ContentError, 'nickname is empty or blank')
        expect(() => registerUser(name, surname, email, ' \t\r')).toThrow(ContentError, 'nickname is empty or blank')

        expect(() => registerUser(name, surname, email, nickname, '')).toThrow(ContentError, 'password is empty or blank')
        expect(() => registerUser(name, surname, email, nickname, ' \t\r')).toThrow(ContentError, 'password is empty or blank')
    })

    afterAll(() => User.deleteMany().then(database.disconnect))
})
