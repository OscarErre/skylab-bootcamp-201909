const { validate, errors: { NotFoundError, ContentError, CredentialsError } } = require('baam-util')
import call from '../utils/call' //eslint-disable-line
//const call = require ('../utils/call')
const API_URL = process.env.REACT_APP_API_URL

//module.exports = function (gameId, token) {
export default function (gameId, token) {

    validate.string(gameId)
    validate.string.notVoid('id', gameId)

    validate.string(token)
    validate.string.notVoid('id', token)

    return (async () => {
        const res = await call(`${API_URL}/games/${gameId}/pass`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (res.status === 200) return JSON.parse(res.body)

        if (res.status === 400) throw new ContentError(JSON.parse(res.body).message)

        if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)

        if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)

    })()
}