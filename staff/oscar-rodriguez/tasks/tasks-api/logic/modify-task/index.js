const validate = require('../../utils/validate')
const { NotFoundError, ContentError } = require('../../utils/errors')
const database = require('../../utils/database')
const { ObjectId } = database

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

    const client = database()
    return client.connect()
        .then (connection => {
            const users = connection.db().collection('users')
            const tasks = connection.db().collection('tasks')
            
            
            return users.findOne({_id: id})
                .then (user => {
                    if (!user) throw new NotFoundError(`user with id ${id.id.toString()} not found`)
            
                    return  tasks.findOne({_id: taskId, user: id.toString()})
                        .then (task => {
                            if (!task) throw new NotFoundError(`user does not have task with id ${taskId.id.toString()}`)
                                        
                            title && (task.title = title)
                            description && (task.description = description)
                            status && (task.status = status)
                            task.lastAccess = new Date
                    
                            return tasks.updateOne({_id : task._id}, { $set: {
                                        title: task.title,
                                        description: task.description,
                                        status: task.status,
                                        lastAccess: task.lastAccess
                            }})
                            .then(result => {
                                if (!result.modifiedCount) throw Error('could not update user')
                            })

                        })



                })

    })
}