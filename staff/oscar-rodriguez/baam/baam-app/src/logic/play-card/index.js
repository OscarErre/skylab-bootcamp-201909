const { validate, errors: { NotFoundError, CantAttackError, CredentialsError } } = require('baam-util')
import call from '../utils/call' //eslint-disable-line
//const call = require ('../utils/call')
const API_URL = process.env.REACT_APP_API_URL

//module.exports = function (gameId, token, cardId) {
export default function (gameId, token, cardId) {

    validate.string(gameId)
    validate.string.notVoid('id', gameId)
    
    validate.string(token)
    validate.string.notVoid('id', token)
    
    validate.string(cardId)
    validate.string.notVoid('id', cardId)
    
    return (async () => {

        const res = await call (`${API_URL}/games/${gameId}/play-card`, {
            method:'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type' : 'application/json'
                
            },
            body: JSON.stringify({cardId})
        })
        
        if (res.status === 200) return

        if (res.status === 404) throw new NotFoundError (JSON.parse(res.body).message)

        if (res.status === 403) throw new CantAttackError (JSON.parse(res.body).message)

        if (res.status === 401) throw new CredentialsError (JSON.parse(res.body).message)

        throw new Error (JSON.parse(res.body).message)
    })()
}