const validate = require('../../utils/validate')
const tasks = require('../../data/tasks')()
const { NotFoundError } = require('../../utils/errors')

module.exports = function (id, title=undefined, description=undefined, status=undefined) {
    validate.string(id)
    validate.string.notVoid('id', id)

    if (title) { 
        validate.string(title)
        validate.string.notVoid('title', title)
    }

    if (description) {
        validate.string(description)
        validate.string.notVoid('description', description)
    }
    
    if (status) {
        validate.string(status)
        validate.string.notVoid('status', status)
    }


    return new Promise((resolve, reject) => {

        //falta contemplar usuario

        const task = tasks.data.find(task => task.id === id)
        if (!task) return reject(new NotFoundError(`task with id ${id} not found`))

        if (title) task.title=title
        if (description) task.description=description
        if (status) task.status=status
        task.lastAcess = new Date()
        
        tasks.persist()
            .then(resolve)
            .catch(reject)

    })
}