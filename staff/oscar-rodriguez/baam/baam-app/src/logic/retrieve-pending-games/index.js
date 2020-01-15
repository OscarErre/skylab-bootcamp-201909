const { errors: { ContentError } } = require('baam-util')
import call from '../utils/call' //eslint-disable-line
//const call = require ('../utils/call')
const API_URL = process.env.REACT_APP_API_URL

//module.exports = function () {
export default function () {    
    
    return (async () => {
        const res = await call (`${API_URL}/games/pending`, {
            method: 'GET'
        })

        if (res.status === 200) return JSON.parse(res.body)

        if (res.status === 400) throw new ContentError (JSON.parse(res.body).message)

        throw new Error (JSON.parse(res.body).message)
    })()
}