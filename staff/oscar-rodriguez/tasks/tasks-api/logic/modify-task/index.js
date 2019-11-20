const validate = require('../../utils/validate')
const { NotFoundError, ContentError } = require('../../utils/errors')
const {ObjectId , models: {User, Task}} = require('../../data')


module.exports = function (id, taskId, title, description, status) {
    validate.string(id)
    validate.string.notVoid('id', id)

    if (!ObjectId.isValid(id)) throw new ContentError(`wrong id: ${id} must be a string of 12 length`)
    id = ObjectId(id)
    
    validate.string(taskId)
    validate.string.notVoid('taskId', taskId)
    
    if (!ObjectId.isValid(taskId)) throw new ContentError(`wrong taskId: ${taskId} must be a string of 12 length`)
    taskId = ObjectId(taskId)
    
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
        validate.matches('status', status, 'TODO', 'DOING', 'REVIEW', 'DONE')
    }
            
    (async function () {
    
        const user = await User.findById({ id })
        if (!user) throw new NotFoundError(`user with id ${id.id.toString()} not found`)
        
        const task = await Task.findOne({ _id: taskId, user: id.toString()})
        if (!task) throw new NotFoundError(`user does not have task with id ${taskId.id.toString()}`)
                    
        title && (task.title = title)
        description && (task.description = description)
        status && (task.status = status)
        task.lastAccess = new Date

        await Task.save()
    })()        
}