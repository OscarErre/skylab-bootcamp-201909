function searchDucks (query, callback) {
    call ('GET','https://duckling-api.herokuapp.com/api/search?q='+query,callback);
}