function retrieveDuck (query, callback) {
    call('GET','http://duckling-api.herokuapp.com/api/ducks/'+query,callback);
}