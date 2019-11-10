const Feedback = require('../feedback')
const Results = require('../results')
const ResultsItem = require('../results-item')
const Detail = require('../detail')

module.exports = function({ name, query, path, logout, error, results, favPath, detailPath, item, favDetailPath, favoritePath, favorites, favFavorites, lastPath }) {
  console.log(lastPath)
  return (
    `<header class='header view__header'>
      <div class='nav'>
        <div class='nav__links-container'>

          <form method="post" action="${favoritePath}">
            <button class='nav__elems nav__button'>Favorites</button>
          </form>

          <form method="post" action="${logout}">
            <button class='nav__elems nav__button'>Logout</button>
          </form>
        </div>
        <p class='nav__elems'>Hello, ${name}</p>
      </div>
      <h1 class='header__title'>Duck Store</h1>
      <form class='header__form form' method ='get' action='${path}'>
        <input class='form__input' type="text" name="query" placeholder="search..." ${query? `value=${query}` : '' } />
        <button class='form__button'>
          <i class="fas fa-search"></i>
        </button>
      </form>
    </header>

    ${results ? Results({ items: results, onItemRender: duck => ResultsItem({ item: duck, favPath, detailPath }) }) : ''}

    ${error ? Results({ error }) : ''}

    ${item ? Detail({ item, lastPath, favDetailPath }) : ''}

    ${favorites ? Results({ items: favorites, onItemRender: duck => ResultsItem({ item: duck, favPath, detailPath }) }) : ''}`

  )
}
//query is added to input value to keep the last search printed in input
    // ${favorites ? Results({ items: favorites, onItemRender: duck => ResultsItem({ item: duck, favPath }) }) : ''}`
