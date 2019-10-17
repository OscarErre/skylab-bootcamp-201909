function call (method, url, callback) {
    fetch (method,url,function (response) {
        if (response.readyState == 4 && response.status == 201) {
            response = JSON.parse(response.responseText);
            callback(response);
        }
    })
}