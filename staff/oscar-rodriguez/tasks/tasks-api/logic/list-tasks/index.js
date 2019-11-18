const validate = require('../../utils/validate')
const { NotFoundError , ContentError} = require('../../utils/errors')
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
                    if (!user) throw new NotFoundError(`user with id ${id.id.toString()} not found`)
                    const tasks = connection.db().collection('tasks')

                    return tasks.find({ user: user._id.toString() }).toArray()
                        .then(results => {
                            const acces = new Date
                            results.forEach(task => {
                                task.id = task._id.toString()
                                delete task._id
                                task.lastAccess = acces
                                return task
                            })

                            return tasks.updateMany({ user: user._id.toString() }, { $set: { lastAccess: acces } })
                                .then(result => {
                                    if (!result.modifiedCount) throw Error('could not update user')
                                    return results
                                })
                        })

                })


        })
}