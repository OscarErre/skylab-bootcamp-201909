var search = new Search (document.getElementsByClassName("form-0")[0]);
search.onSubmit(listSearchResults);
search.onReset(listAll);

listAll();

function listAll() {
    listSearchResults('');
}

function listSearchResults (query) {
    searchDucks(query,paintListResults);
}

function createDuckDetail (id) {
    retrieveDuck (id, paintDuckDetails);
}

function paintListResults (ducks) {
    var ducksList = document.getElementById("search-list");
    ducksList.innerHTML="";
    
    var ul = createElement('ul','class','search-list');
    ducksList.append(ul);

    ducks.forEach(function(duck) {

            var li = createElement('li','class',"search-list__entry entry");
            var img = createElement('img','class','entry__img','src',duck.imageUrl);
            var title = createElement('div','class','entry__tittle',"innerHtml",duck.title);
            var price = createElement('div',"innerHtml",duck.price,"class","entry__price");

            li.append(img);
            li.append(title);
            li.append(price);
            
            var link = createElement("a",'class',"link",'href', '#'+duck.id);

            link.addEventListener('click',function (event){
                    createDuckDetail(duck.id)});

            link.append(li);
            ul.append(link);
    
    });
}


function paintDuckDetails (duckInfo) {

    var list_Panel = document.getElementById("search-list");
    var duck_Panel = document.getElementById("duck-detail");

    list_Panel.style.display = "none";
    duck_Panel.innerHTML = "";
    duck_Panel.style.display = "flex";

    var title = createElement("h1",'class','duck-detail__title','innerHtml',duckInfo.title);
    var description = createElement("p","class","duck-detail__description","innerHtml",duckInfo.description);
    var image = createElement("img",'class',"duck-detail__image",'src',duckInfo.imageUrl);
    var price = createElement("div",'class','duck-detail__price','innerHtml',duckInfo.price);
    var link = createElement("a", 'class','link',"innerHtml","Go to Duck's shopping page","href",duckInfo.link);

    var back = createElement("button","innerHtml","Atrás",'class','duck-detail__back');
    back.addEventListener('click', function (){
        list_Panel.style.display = "flex";
        duck_Panel.style.display = "none";
    })

    duck_Panel.append(title);
    duck_Panel.append(back);
    duck_Panel.append(description);
    duck_Panel.append(image);
    duck_Panel.append(price);
    duck_Panel.append(link);
}

/* function listSearch(e) {
    e.preventDefault()

    var search = this.search.value;
    var duck_Panel = document.getElementById("duck-detail");
    var list_Panel = document.getElementById("search-list");

    if (duck_Panel.style.display !== "none") {
        duck_Panel.style.display = "none";
        list_Panel.style.display = "flex";
    }

    listSearchResults(search);
} */

