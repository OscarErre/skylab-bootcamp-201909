const { validate, errors: { CredentialsError } } = require('baam-util')
const API_URL = process.env.REACT_APP_API_URL
// const call = require ('../utils/call')
import call from '../utils/call' //eslint-disable-line

//module.exports = function (nickname, password) {
export default function (nickname, password) {
    validate.string(nickname)
    validate.string.notVoid('nickname', nickname)
    validate.string(password)
    validate.string.notVoid('password', password)

    return (async () => {
        console.log('call', call)
        const res = await call(`${API_URL}/users/auth`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({nickname, password})
        })

        if (res.status === 200) return JSON.parse(res.body).token

        if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)

        throw new Error(JSON.parse(res.body).message)
    })()
}
