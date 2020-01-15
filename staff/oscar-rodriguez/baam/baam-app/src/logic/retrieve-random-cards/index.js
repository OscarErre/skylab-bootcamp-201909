const { validate, errors: { NotFoundError, ContentError } } = require('baam-util')
import call from '../utils/call' //eslint-disable-line
//const call = require ('../utils/call')
const API_URL = process.env.REACT_APP_API_URL


//module.exports = function (size) {
export default function (size) {
    
    validate.number(size)
    if (size <= 0) throw new ContentError('please, size must be greater than 0')

    return (async () => {
        const res = await call(`${API_URL}/cards/random/${size}`, {
            method: 'GET'
        })

        if (res.status === 200) return JSON.parse(res.body)

        if (res.status === 400) throw new ContentError (JSON.parse(res.body).message)

        if (res.status === 404) throw new NotFoundError (JSON.parse(res.body).message)

        throw new Error (JSON.parse(res.body).message)
    })()
}