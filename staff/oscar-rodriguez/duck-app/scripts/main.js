var duck_Detail = document.getElementById("duck-detail");
var search_List = document.getElementById("search-list"); 

var search = new Search (document.getElementsByClassName("form-0")[0]);
search.onSubmit(function (query) {
    searchDucks(query,paintListResults);
});

search.onReset(function () {
    searchDucks('',paintListResults);
});

searchDucks('',paintListResults);

function paintListResults (ducks) {
    duck_Detail.classList.add("hide");
    search_List.classList.remove("hide");
    ducks_List_Panel.pintar(ducks);
}

var ul = createElement('ul','class','search-list');
search_List.append(ul);

var ducks_List_Panel = new Results(ul);
ducks_List_Panel.onItemRender = function () {
    var item = new Register(createElement("a",'class',"link",'href', '#'));
    item.onClick = function (id) {
        retrieveDuck (id, function (duckInfo) {
            duck_Detail.classList.remove("hide");
            search_List.classList.add("hide");

            var duck_Panel = new Detail (document.getElementById("duck-detail"));
            duck_Panel.empty();

            duck_Panel.onBack = function (){
                duck_Detail.classList.add("hide");
                search_List.classList.remove("hide");
            };
            duck_Panel.pintar (duckInfo);
        });
    };

    return item;
}

