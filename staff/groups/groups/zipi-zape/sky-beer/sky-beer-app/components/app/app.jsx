const { Component } = React

class App extends Component {
    constructor () {
        super()
        this.state = {login : false, randomBeers : [], beerId : undefined, logged: false, showMobileSearch: false}
    }

    componentDidMount () {
        const credentials = JSON.parse(sessionStorage.getItem('credentials'))
        if (credentials) {
            const { id , token } = credentials
            this.setState ({id : id , token : token, logged : true})
            try {
                retrieveUser(id, token, (error, user) => {
                    if (error) this.setState({ error: error.message })
                    else {
                        const { name } = user
                        this.setState({ name: name })
                        this.setState ({error: undefined})
                    }
                })
            } catch (error) {
                this.setState({ error: error.message })
            }
        }
        
        let random = []
        for (let i=0; i<4; i++) {
            try {
                retrieveRandomBeer((error, beer) => {
                    if(error) this.setState({error : error.message})
                    else random.push(beer)
                    this.setState({randomBeers : random})
                })
            } catch (error) {
                this.setState( {error: error.message})
            }
        }
    }

    handleBurguer = () => {
        this.setState ({showMobileSearch: !this.state.showMobileSearch})
    }

    handleBeers = () => {

        this.handleSearch('beer_name=all')

    }

    handleCommunity = () => {

    }

    handleSearch = (query) => {
        try {
            let { id, token } = this.state
            searchBeers(query, {'id': id,'token': token}, (error, results)=> {
                if (error) this.setState ({error : error.message})
                else this.setState ({searchResults : results, query : query, error: undefined});
            })
        } catch (error) {
            this.setState ({ error : error.message})
        }
    }

    handleInvest = () => {

    }

    handleShowLogin = () => {
        this.setState ({login : !(this.state.login)})
    }

    handleLogin = (username, password) => {
        try {
            authenticateUser (username, password, (error, credentials)=>{
                if (error) this.setState ({error : error.message})
                else {
                    sessionStorage.setItem ('credentials', JSON.stringify(credentials))
                    this.setState ({id : credentials.id , token : credentials.token, logged: true, error: undefined})
                    try{
                        retrieveUser (credentials.id, credentials.token, (error, user) => {
                            if (error) this.setState ({error : error.message})
                            else this.setState ({name : user.name, login : false, error: undefined})
                        })
                    } catch (error) {
                        this.setState ({ error : error.message})
                    }
                }
            })  
        } catch (error) {
            this.setState ({ error : error.message })
        }
    }

    handleRegister = (name, surname, email, password) => {
        try{
            registerUser(name, surname, email, password, error => {
                if (error) this.setState ({ error:  error.message })    
                else this.setState ({ login : false, error: undefined })
            }) 
            
        } catch (error) {
            this.setState ({ error: error.message })
        }
    }

    handleOnCloseItem = () => {
        this.setState ({beerId : undefined})
    }

    handleClickItem = (beerId) => {
        try {
            let {id, token} = this.state
            retrieveBeer (beerId, {'id': id,'token': token}, (error, beer)=> {
                if (error) this.setState ({error: error.message})
                else {
                    this.setState ({beerId : beer, error: undefined})
                }
            })
        } catch (error) {this.setState({error: error.message})}
    }

    handleOnCloseSearch = () => {
        this.setState ({searchResults : undefined})
    }


    handleLogout = () => {
        this.setState ({logged: false, name: undefined, id: undefined, token: undefined })
        sessionStorage.clear()
    }

    handleFavs = (beerId) =>{
        const { searchResults, id, token } = this.state
        
        const index = searchResults.findIndex(duck=>{
            return duck.id === beerId
        })
        searchResults[index].fav = !searchResults[index].fav
        this.setState({ searchResults})

        try {
            toogleFav(id,token,beerId,(error, results) => {
                if (error) this.setState({error: error.message})
            })
        } catch (error) {this.setState({error: error.message})}
    }

    handleRates = (beerId, rating) => {
        const { id,token, beerId: beer } = this.state
        
        beer.rate = rating
        this.setState({ beer })

        try {
            rateBeer(id,token,beerId,rating, (error, results) => {
                if (error) this.setState({error: error.message})
            })
        } catch (error) {this.setState({error: error.message})}
    }


    render () {
        const { state: {logged, login, name, randomBeers, searchResults, beerId, query, showMobileSearch, error}, handleLogout, handleOnCloseSearch,handleOnCloseItem, handleClickItem, handleShowLogin, handleRegister, handleRates, handleFavs, handleBurguer, handleBeers, handleCommunity, handleSearch, handleInvest, handleLogin } = this

        return <>
            <Header onBurguer={handleBurguer} onBeers={handleBeers} onCommunity={handleCommunity} onSubmit={handleSearch} onInvest={handleInvest} onLogin={handleShowLogin} name={name} showSearch={showMobileSearch} />
            {login && <Login logged={logged} name={name} onLogin={handleLogin} onRegister={handleRegister} onLogout={handleLogout} error={error} />}
            {}
            <main className="main">
                {(searchResults) && <SearchResults searchResults={searchResults} onClickItem={handleClickItem} onClose={handleOnCloseSearch} query={query} onSubmit={handleSearch} logged={logged} onFav={handleFavs} onRate={handleRates}/>}
                {(beerId) && <BeerDetail beer={beerId} onClose={handleOnCloseItem} logged={logged} onFav={handleFavs} onRate={handleRates}/>}
                {(randomBeers.length === 4) && <Welcome randomBeers={randomBeers} onClickItem={handleClickItem}/>}
                <Speech title="THE BEER EXPERIENCE" text="Join to the best Brewdog's Punk Community. We don't like beer, we are beer."/>
                <Brewdog />
                <Video />
            </main>
            <Footer />
        </>
    }
}