const validate = require('../../utils/validate')
const users = require('../../data/users')
const { NotFoundError } = require('../../utils/errors')

module.exports = function (id) {
    validate.string(id)
    validate.string.notVoid('id', id)

    return new Promise((resolve, reject) => {
        const user = users.find(user => user.id === id)

        if (!user) return reject(new NotFoundError(`user with id ${id} not found`))

        const { name, surname, email, username } = user
        
        const index = users.findIndex (user=>user.id === id)

        users[index].lastAcces = new Date()

        resolve({ id, name, surname, email, username })
    })
}