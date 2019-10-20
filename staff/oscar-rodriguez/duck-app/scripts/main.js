const duck_Detail = document.getElementById("duck-detail");
const search_List = document.getElementById("search-list");

const header = document.getElementsByClassName("header")[0];
const start = document.getElementsByClassName("header__image")[0];
const main = document.getElementsByClassName("main")[0];
const search_bar = document.getElementsByClassName("search-bar")[0];

start.addEventListener('click', () => {
    //start.classList.add("hide")
    header.classList.add("header--login")
    main.classList.remove("hide")

})

const onSignUpClick = document.getElementsByClassName("sign-up")[0];
const onSignInClick = document.getElementsByClassName("login")[0];

onSignUpClick.addEventListener ('click', () => {
    //document.getElementsByClassName("or")[0].classList.add("hide");
    document.getElementsByClassName("login__form")[0].classList.add("hide");
    document.getElementsByClassName("register-container")[0].classList.add("register-container--sign-up");
    document.getElementsByClassName("sign-up__form")[0].classList.remove("hide");
})


onSignInClick.addEventListener ('click', () => {
    //document.getElementsByClassName("or")[0].classList.add("hide");
    document.getElementsByClassName("login__form")[0].classList.remove("hide");
    document.getElementsByClassName("register-container")[0].classList.add("register-container--sign-up");
    document.getElementsByClassName("sign-up__form")[0].classList.add("hide");
})
const doLogin = (username, password) => {
    authenticateUser(username,password,(error,credentials)=> {
        if (error)
            document.getElementsByClassName("login__error")[0].classList.remove("hide")
        else
            loginOk(credentials)
    });
}
var login = new Login (document.getElementsByClassName("login__form")[0]);
login.onSubmit ( (credentials) => {
    doLogin (credentials.username, credentials.password)    
});

var newUser = new SignUp (document.getElementsByClassName("sign-up__form")[0]);
newUser.onSubmit ( credentials => {    
    registerUser(credentials.name, credentials.surname, credentials.username, credentials.password,(error,credentials)=> {
        if (error)
            document.getElementsByClassName("login__error")[0].classList.remove("hide")
        else
            debugger
            doLogin(credentials.username,credentials.password);
    });
});

function loginOk(credentials) {

    search_bar.classList.remove("hide")

    retrieveUser(credentials.id,credentials.token,(error,userData) => {
        
        if (error) alert (error.message)
        else {
        
            const userSpace = document.getElementsByClassName("header__user-space")[0]
            userSpace.getElementsByClassName("user-name")[0].innerHTML = userData.data.name
            userSpace.classList.remove("hide");
            var search_form = document.getElementsByClassName("form-0")[0];
            search_form.classList.remove("hide");
        
            var search = new Search (search_form);
            search.onSubmit(function (query) {

            searchDucks(query, (error, ducks) => {
                if( error ) {
                    alert ("error");
                } else {
                    duck_Detail.classList.add("hide");
                    search_List.classList.remove("hide");
                    ducks_List_Panel.pintar(ducks);
                }
            })
        });
        
        search.onReset(function () {
            searchDucks('',(error, ducks) => {
                if( error ) {
                    alert ("error");
                } else {
                    duck_Detail.classList.add("hide");
                    search_List.classList.remove("hide");
                    ducks_List_Panel.pintar(ducks);
                }
            })
        });
        
        document.getElementsByClassName("login__error")[0].classList.add("hide");
        document.getElementsByClassName("register-container")[0].classList.add("hide")

            searchDucks('', (error, ducks) => {
                duck_Detail.classList.add("hide");
                search_List.classList.remove("hide");
                ducks_List_Panel.pintar(ducks);
            });

            var ul = createElement('ul','class','search-list');
            search_List.append(ul);
            
            var ducks_List_Panel = new Results(ul);
            ducks_List_Panel.onItemRender = function () {
                var item = new Register(createElement("a",'class',"link",'href', '#'));
                item.onClick = function (id) {
                    retrieveDuck (id, function (error,duckInfo) {
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
    });
    
}