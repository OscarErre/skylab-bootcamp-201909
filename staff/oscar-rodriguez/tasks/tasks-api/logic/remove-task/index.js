const validate = require('../../utils/validate')
const tasks = require('../../data/tasks')()
const users = require('../../data/users')()
const { NotFoundError, ConflictError } = require('../../utils/errors')

module.exports = function (id, taskId) {
    validate.string(id)
    validate.string.notVoid('id', id)
    
    return new Promise((resolve, reject) => {
        const user = users.data.find(user => user.id === id)

        if (!user) return reject(new NotFoundError(`user with id ${id} not found`))

        const index = tasks.data.findIndex(task => task.id === taskId)

        if (index<0) return reject(new NotFoundError(`task with id ${taskId} not found`))

        if (tasks.data[index].user !== id) return reject(new ConflictError(`user with id ${id} does not correspond to task with id ${taskId}`))

        tasks.data.splice(index,1)
        tasks.persist().then(() => resolve()).catch(reject)

    })
}