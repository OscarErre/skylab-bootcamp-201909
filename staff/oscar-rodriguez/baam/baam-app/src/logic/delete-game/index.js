const { validate, errors: { CredentialsError, NotFoundError, ConflictError, ContentError } } = require('baam-util')
import call from '../utils/call' //eslint-disable-line
//const call = require ('../utils/call')
const API_URL = process.env.REACT_APP_API_URL

//module.exports = function (gameId, token) {
export default function (gameId, token) {
    validate.string(gameId)
    validate.string.notVoid('gameId', gameId)

    validate.string(token)
    validate.string.notVoid('token', token)

    return (async () => {
        const res = await call (`${API_URL}/games/${gameId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        
        if (res.status === 200) return

        if (res.status === 400) throw new ContentError (JSON.parse(res.body).message)

        if (res.status === 401) throw new CredentialsError (JSON.parse(res.body).message)

        if (res.status === 403) throw new ConflictError (JSON.parse(res.body).message)

        if (res.status === 404) throw new NotFoundError (JSON.parse(res.body).message)

        throw new Error (JSON.parse(res.body).message)
    })()
}