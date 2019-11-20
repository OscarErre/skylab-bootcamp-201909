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
            if (!user) throw new NotFoundError(`user with id ${id.id.toString()} not found`)

            const access = new Date
            return Task.updateMany ({user: user.id}, { $set: { lastAccess : access}})
                        .then (() => Task.find({ user: user.id }).lean()
                                        .then(results => {
                                                
                                            results.forEach(task => {
                                                task.id = task._id.toString()
                                                delete task._id
                                                task.user = user.id
                                            })
                                            return results
                                        })
                        )

        })
}