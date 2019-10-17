var myForm = document.getElementsByClassName('myForm');
var searchElement = document.getElementsByClassName('search')[0];
var resultElement = document.getElementsByClassName('result')[0];
resultElement.hidden = true;
var landingEnable = true
search();

/**
 * 
 * @param {Event} e reference of the event
 */
function search(e) {
    var textToFind = myForm[0][0].value;
    var uri = 'https://duckling-api.herokuapp.com/api/search?q=' + textToFind;
    xhr(uri, printDucks);
    if (e !== undefined) {
        e.preventDefault();
    }
}

/**
 * 
 * Creates each article(duks) in the landing page
 * using DOM
 * 
 * @param {object[]} ducks array of ducks
 */
function printDucks(ducks) {
    var container = document.getElementsByClassName('search__main');
    container = container[0];
    container.innerHTML = "";
    ducks.forEach(function(duck) {

        var article = document.createElement('article');
        article.className = 'main__article article';

        article.setAttribute('onclick', "onDuckClick('" + duck.id + "')");

        var title = document.createElement('p');
        title.className = 'article__title';
        title.innerText = duck.title;

        var image = document.createElement('img');
        image.className = 'article__image';
        image.src = duck.imageUrl;

        var price = document.createElement('p');
        price.className = 'article__price';
        price.innerText = duck.price;

        article.append(title, image, price);
        container.append(article);
    });
}

/**
 * 
 * Creates article(duk) in the article page
 * using DOM
 * 
 * @param {object} duck That's an object with the duck description
 */
function printDuckSpecs(duck) {
    var container = document.getElementsByClassName('result__main');
    container = container[0];
    container.innerHTML = "";

    img_desc_container = document.createElement('div');
    img_desc_container.className = 'article__specs__container';

    var article = document.createElement('article');
    article.className = 'main__article article__specs';


    var title = document.createElement('p');
    title.className = 'article__title';
    title.innerText = duck.title;

    var image = document.createElement('img');
    image.className = 'article__image';
    image.src = duck.imageUrl;

    var price = document.createElement('p');
    price.className = 'article__price';
    price.innerText = duck.price;


    var description = document.createElement('p');
    description.className = 'article__description';
    description.innerText = duck.description;

    img_desc_container.append(image, description);

    article.append(title, img_desc_container, price);
    container.append(article);
}



/**
 * 
 * Creates a xhr to find a specific duck, and call
 * a function to print it(printDuckSpecs)
 * 
 * @param {string} id that's the duck id to find into duck API
 */
function onDuckClick(id) {
    landingEnable = false;
    searchElement.hidden = true;
    resultElement.hidden = false;

    var uri = 'https://duckling-api.herokuapp.com/api/ducks/' + id;
    xhr(uri, printDuckSpecs);
}


/**
 * 
 * Swith from article page to landing page
 * 
 */
function goBack() {
    searchElement.hidden = false;
    resultElement.hidden = true;
    landingEnable = true;
}


/**
 * 
 * creates and xhr request, and executes the callback
 * 
 * @param {*} uri uri to request info 
 * @param {*} callback function to execute after response
 */
function xhr(uri, callback) {
    var xhr = new XMLHttpRequest;
    xhr.open('GET', uri);
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 201) {
            callback(JSON.parse(xhr.responseText));
        }
    };
    xhr.send();

}