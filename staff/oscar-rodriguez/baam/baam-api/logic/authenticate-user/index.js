const { validate, errors: { CredentialsError } } = require('baam-util')
const { models: { User } } = require('baam-data')

module.exports = function (nickname, password) {
    validate.string(nickname)
    validate.string.notVoid('nickname', nickname)
    validate.string(password)
    validate.string.notVoid('password', password)

    return (async () => {
        const user = await User.findOne({ nickname, password })

        if (!user) throw new CredentialsError('wrong credentials')

        user.lastAccess = new Date

        await user.save()

        return user.id
    })()
}
