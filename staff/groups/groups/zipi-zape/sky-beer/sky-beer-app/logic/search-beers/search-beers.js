function searchBeers (query, credentials, callback) {

    if(typeof query !== 'string') throw new TypeError (`${query} is not a string`)
    if(typeof callback !== 'function') throw new TypeError (`${callback} is not a function`)

    call('GET', `https://api.punkapi.com/v2/beers?${query}`, undefined, undefined, results => {
        if (results.error) callback (new Error (result.error))
        else {
            const {id, token} = credentials
            if (id !== undefined && token !== undefined) {
                call('GET', 'https://skylabcoders.herokuapp.com/api/user/' + id, undefined, token, user => {
                    if (user.error ) callback(new Error(user.error))
                    else {
                        const {favs = [], rates} = user.data  
                        callback(undefined, results.map( beer => {
                            if(beer.image_url === null) beer.image_url = './img/noimage.png'
                                            
                            favs.includes(beer.id) ? beer.fav = true : beer.fav = false
                            let rated
                            if (rates)  rated = rates.find ( elem => beer.id===elem.id )
                            else rated = undefined
        
                            if (rated !== undefined) beer.rating = rated.rating
                            else beer.rating = 0
        
                            return beer
                        }))  
                    }
                })
            } else callback(undefined, results)
        } 
    })
}