const { validate, errors: { CredentialsError, NotFoundError } } = require('baam-util')
const API_URL = process.env.REACT_APP_API_URL
import call from '../utils/call' //eslint-disable-line
//const call = require ('../utils/call')

//module.exports = function (token, gameId) {
export default function (token, gameId) {
    validate.string(token)
    validate.string.notVoid('id', token)

    validate.string(gameId)
    validate.string.notVoid('id', gameId)

    return (async () => {
        const res = await call (`${API_URL}/games/${gameId}/join`, {
            method: 'GET',
            headers: {Authorization: `Bearer ${token}`}
        })
        
        if (res.status === 200) return JSON.parse(res.body)

        if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)

        if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)

        throw new Error (JSON.parse(res.body).message)
    })()
}