/* function call (method, url, callback) {
    fetch (method,url,function (response) {
        if (response.readyState == 4 && response.status == 201) {
            response = JSON.parse(response.responseText);
            callback(response);
        }
    })
} */

function call(method, url, body, token, callback) {
    let headers = {}

    if (body) headers['Content-Type'] = 'application/json;charset=UTF-8'
    if (token) headers['Authorization'] = 'Bearer '+token

    fetch(method, url, headers, body, function (response) {
        if (response.readyState == 4) {
            var result = JSON.parse(response.responseText);

            callback(result);
        }
    });
}