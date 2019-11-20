const validate = require('../../utils/validate')
const { NotFoundError, ContentError } = require('../../utils/errors')
const { ObjectId, models: { User, Task } } = require('../../data')

module.exports = function (id) {
    validate.string(id)
    validate.string.notVoid('id', id)

    if (!ObjectId.isValid(id)) throw new ContentError(`wrong id: ${id} must be a string of 12 length`)
    id = ObjectId(id)

    return User.findById(id)
        .then(user => {
            if (!user) throw new NotFoundError(`user not found`)

            return Task.updateMany({ user: id }, { $set: { lastAccess: new Date } })
        })
        .then(() => Task.find({ user: id }).lean())
        .then(tasks => {
            tasks.forEach(task => {
                task.id = task._id.toString()
                task.user = task.user.toString()
                delete task._id
            })

            return tasks
        })
}