function retrieveUser(id,token, callback) {
    if (typeof id !== 'string') throw new TypeError(id + ' is not a string')
    if (typeof token !== 'string') throw new TypeError(token + ' is not a string')
    // if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function')

    request('GET', 'https://skylabcoders.herokuapp.com/api/user/'+id,{"token":token}, callback)

}