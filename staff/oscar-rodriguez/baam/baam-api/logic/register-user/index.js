const { validate, errors: { ConflictError } } = require('baam-util')
const { models: { User } } = require('baam-data')

module.exports = function (name, surname, email, nickname, password) {
    validate.string(name)
    validate.string.notVoid('name', name)
    validate.string(surname)
    validate.string.notVoid('surname', surname)
    validate.string(email)
    validate.string.notVoid('e-mail', email)
    validate.email(email)
    validate.string(nickname)
    validate.string.notVoid('nickname', nickname)
    validate.string(password)
    validate.string.notVoid('password', password)

    return (async () => {
        const user = await User.findOne({ nickname })

        if (user) throw new ConflictError(`user with nickname ${nickname} already exists`)

        await User.create({ name, surname, email, nickname, password })
    })()
}
