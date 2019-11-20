const validate = require('../../utils/validate')
const { NotFoundError, ContentError } = require('../../utils/errors')
const { models: { User } } = require('../../data')
const { ObjectId } = require('mongodb')

module.exports = function (id) {
    validate.string(id)
    validate.string.notVoid('id', id)

    if (!ObjectId.isValid(id)) throw new ContentError(`wrong id: ${id} must be a string of 12 length`)
    id = ObjectId(id)


    return User.findOne({ _id: id })
        .then(user => {
            if (!user) throw new NotFoundError(`user not found`)

            const { id } = user

            user.lastAccess = new Date

            return user.save()
                .then(()=> {
                    const { name, surname, username, email, lastAccess } = user
                    return ({ id, name, surname, username, email, lastAccess })
                })
        })
}