const { validate, errors: { NotFoundError, ContentError, CredentialsError } } = require('baam-util')
const API_URL = process.env.REACT_APP_API_URL
import call from '../utils/call' //eslint-disable-line
//const call = require('../utils/call')

//module.exports = function (token, cards) {
export default function (token, cards) {

    validate.string(token)
    validate.string.notVoid('id', token)

    validate.array(cards)
    if (cards.length <= 0) throw new ContentError(`can't add 0 or less cards`)

    return (async () => {
        const res = await call(`${API_URL}/users/cards`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cards })
        })

        if (res.status === 200) return

        if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
        if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)

        throw new Error(JSON.parse(res.body).message)
    })()
}