const { validate, errors: { NotFoundError, ContentError, ConflictError } } = require('baam-util')
const HAND_LENGTH = process.env.REACT_APP_HAND_LENGTH
const API_URL = process.env.REACT_APP_API_URL
import call from '../utils/call' //eslint-disable-line

//module.exports = function (gameId, token, hand) {
export default function (gameId, token, hand) {
    validate.string(gameId)
    validate.string.notVoid('id', gameId)

    validate.string(token)
    validate.string.notVoid('id', token)

    validate.array(hand)
    if (hand.length != HAND_LENGTH) throw new ConflictError(`hand must have ${HAND_LENGTH} cards to play`)

    return (async () => {
        const res = await call (`${API_URL}/games/${gameId}/add-hand`,{
            method:'PATCH',
            headers:{
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({hand})
        })
        
        if (res.status === 200) return

        if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)

        throw new Error (JSON.parse(res.body).message)
    })()
}