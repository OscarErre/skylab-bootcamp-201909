var duck_Detail = document.getElementById("duck-detail");
var search_List = document.getElementById("search-list");

var login = new Login (document.getElementsByClassName("login__form")[0]);
login.onSubmit(succes => {
    (succes) ? loginOk() : document.getElementsByClassName("login__error")[0].classList.remove("hide") }
);

var newUser = new SignUp (document.getElementsByClassName("sign-up__form")[0]);
newUser.onSubmit(function (succes) { (succes) ? registerOk() : document.getElementsByClassName("sign-up__error")[0].classList.remove("hide") });

function registerOk (){
    loginOk();
}

function loginOk() {

    var search_form = document.getElementsByClassName("form-0")[0];
    search_form.classList.remove("hide");

    var search = new Search (search_form);
    search.onSubmit(function (query) {
        searchDucks(query,paintListResults);
    });
    
    search.onReset(function () {
        searchDucks('',paintListResults);
    });
    

    document.getElementsByClassName("login__error")[0].classList.add("hide");
    document.getElementsByClassName("register-container")[0].classList.add("hide")

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
   
}