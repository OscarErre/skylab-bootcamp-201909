const validate = require('../../utils/validate')
const { NotFoundError, ContentError } = require('../../utils/errors')
const database = require('../../utils/database')
const { ObjectId } = database

module.exports = function (id) {
    validate.string(id)
    validate.string.notVoid('id', id)

    const client = database()

    return client.connect()
        .then(connection => {
            const users = connection.db().collection('users')
            try {
                id = ObjectId(id)
            }
            catch {
                throw new ContentError(`wrong id: ${id} must be a string of 12 length`)
            }
            return users.findOne({ _id: id })
                .then(user => {
                    if (!user) throw new NotFoundError(`user with id ${id.id} not found`)

                    const { _id } = user

                    return users.updateOne({ _id }, { $set: { lastAccess: new Date } })
                        .then(result => {
                            if (!result.modifiedCount) throw Error('could not update user')
                            const { _id, name, surname, username, email } = user
                            return ({ id: _id.toString(), name, surname, username, email })
                        })
                })
        })
}