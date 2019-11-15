const validate = require('../../utils/validate')
const tasks = require('../../data/tasks')()
const { NotFoundError } = require('../../utils/errors')

module.exports = function (id) {
    validate.string(id)
    validate.string.notVoid('id', id)
    
    return new Promise((resolve, reject) => {

        const index = tasks.data.findIndex(task => task.id === id)

        if (index<0) return reject(new NotFoundError(`task with id ${id} not found`))

        tasks.data.splice(index,1)
        tasks.persist().then(() => resolve()).catch(reject)

    })
}