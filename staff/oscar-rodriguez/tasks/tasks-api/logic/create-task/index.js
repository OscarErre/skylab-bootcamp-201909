const validate = require('../../utils/validate')
const { NotFoundError, ContentError } = require('../../utils/errors')
const database = require('../../utils/database')
const { models: { User, Task } } = require('../../data')
const { ObjectId } = require('mongodb')

module.exports = function (id, title, description) {
    validate.string(id)
    validate.string.notVoid('id', id)

    if (!ObjectId.isValid(id)) throw new ContentError(`wrong id: ${id} must be a string of 12 length`)
    id = ObjectId(id)

    validate.string(title)
    validate.string.notVoid('title', title)
    validate.string(description)
    validate.string.notVoid('description', description)

    return User.findOne({ _id: id })
        .then(res => {
            if (!res) throw new NotFoundError(`user with id ${id.id.toString()} not found`)

            const task = {
                user: id,
                title,
                description,
                status: 'TODO',
                date: new Date
            }

            return Task.create(task)
                .then(result => {
                    return result.id
                })
        })

}