const call = require('../../utils/call')
const { validate, errors: { CredentialsError } } = require('tasks-util')
const { env: { REACT_APP_API_URL: API_URL } } = process


module.exports = function (token) {

    validate.string(token)
    validate.string.notVoid('token', token)

    return (async () => {
        const res = await call(`${API_URL}/users`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
        })

        if (res.status === 201) return

        throw new Error(JSON.parse(res.body).message)
    })()

}