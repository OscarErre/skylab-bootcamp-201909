/* function fetch (method, url, callback) {
    var ducksRequest = new XMLHttpRequest;
    ducksRequest.open(method, url);
    
    ducksRequest.onreadystatechange = function() {
        callback (this);
    };
    
    ducksRequest.send();
} */


function fetch(method, url, headers, body, callback) {
    var xhr = new XMLHttpRequest;

    xhr.open(method, url);

    xhr.onreadystatechange = function () {
        callback(this);
    };

    if (headers) 
        for (let key in headers)
            xhr.setRequestHeader(key, headers[key])

    body? xhr.send(JSON.stringify(body)) : xhr.send();
}



/**
 * create an html element the specified atributes. The atribute and it's value, must be sent on pairs.
 * 
 * @param {String} elem - The name of element we want to create.
 * @param {String} Atribute Optional - The atribute of element we want to assign a value.
 * @param {String} Value Required if Atribute is sent - The value of the atribute.
 */
function createElement (elem) {
    var element = document.createElement(elem);

    for ( let i=1; i<arguments.length; i+=2) {

        if (arguments[i].toLowerCase() === "innerhtml" || arguments[i].toLowerCase() === "innertext") {
            element.innerHTML=arguments[i+1];
        } else {
            element.setAttribute(arguments[i],arguments[i+1]);
        }
    }
	return element;
}

if (typeof Function.prototype.extend === 'undefined')
    Function.prototype.extend = function(constructor) {
        this.prototype = Object.create(constructor.prototype);
        this.prototype.constructor = this;
    }