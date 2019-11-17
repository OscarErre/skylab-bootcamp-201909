const validate = require('../../utils/validate')
const { NotFoundError, ContentError } = require('../../utils/errors')
const database = require('../../utils/database')
const { ObjectId } = database

module.exports = function (id, taskId) {
    validate.string(id)
    validate.string.notVoid('id', id)
    validate.string(taskId)
    validate.string.notVoid('taskId', taskId)

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
                    if (!user) throw new NotFoundError(`user with id ${id.id.toString()} not found`)

                    const tasks = connection.db().collection('tasks')

                    try {
                        taskId = ObjectId(taskId)
                    }
                    catch {
                        throw new ContentError(`wrong taskId: ${taskId} must be a string of 12 length`)
                    }

                    return tasks.deleteOne({ _id: taskId , user: id.toString()})
                        .then(result => {
                            if (!result.deletedCount) throw new NotFoundError(`task with id ${taskId.id.toString()} does not matcht to this user`)
                        })

            })
    })

}