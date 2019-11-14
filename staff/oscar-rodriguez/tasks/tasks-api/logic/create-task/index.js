const validate = require('../../utils/validate')
const users = require('../../data/users')()
const tasks = require('../../data/tasks')()
const uuid = require('uuid/v4')
const { ConflictError } = require('../../utils/errors')

module.exports = function (userId, title, description) {
    validate.string(userId)
    validate.string.notVoid('userId', userId)
    validate.string(title)
    validate.string.notVoid('title', title)
    validate.string(description)
    validate.string.notVoid('description', description)
    validate.string(status)
    validate.string.notVoid('status', status)


    return new Promise((resolve, reject) => {



    })
}