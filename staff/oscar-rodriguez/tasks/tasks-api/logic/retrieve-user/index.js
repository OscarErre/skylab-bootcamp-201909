const validate = require('../../utils/validate')
const { NotFoundError, ContentError } = require('../../utils/errors')
const database = require('../../utils/database')
const { ObjectId } = database

module.exports = function (id) {
    validate.string(id)
    validate.string.notVoid('id', id)

    if (!ObjectId.isValid(id)) throw new ContentError(`wrong id: ${id} must be a string of 12 length`)
    id = ObjectId(id)
    
    const client = database()

    return client.connect()
        .then(connection => {
            const users = connection.db().collection('users')
            
            return users.findOne({ _id: id })
                .then(user => {
                    if (!user) throw new NotFoundError(`user with id ${id.id} not found`)

                    const { _id } = user

                    user.lastAccess = new Date

                    return users.updateOne({ _id }, { $set: { lastAccess: user.lastAccess } })
                        .then(result => {
                            if (!result.modifiedCount) throw Error('could not update user')
                            const { _id, name, surname, username, email, lastAccess} = user
                            return ({ id: _id.toString(), name, surname, username, email, lastAccess})
                        })
                })
        })
}