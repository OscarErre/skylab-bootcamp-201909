const { validate, errors: { NotFoundError, ContentError } } = require('baam-util')
const { ObjectId, models: { Card } } = require('baam-data')
module.exports = function (size) {
    
    function shuffle (array) {
        let result = [];

        for (let i = 0; i < array.length; i++) result[i] = array[i];

        for (let i = 0; i < result.length; i++) {
            let random = Math.floor(Math.random() * result.length);

            let value = result[i];

            result[i] = result[random];

            result[random] = value;
        }

        return result
    }

    validate.number(size)
    if (size <= 0) throw new ContentError('please, size must be greater than 0')

    return (async () => {
        let cards = await Card.find().lean()
        if (cards.length === 0) throw new NotFoundError(`there are no cards at Database!`)
        cards = shuffle(cards)
        cards = shuffle(cards)
        cards = shuffle(cards)
        size = size < cards.length ? size : cards.length

        cards = cards.slice(0, size)

        return cards.map(
            ({ _id, name, description, image, price, col, effect, effectValue, target }) => { return { id: _id.toString(), name, description, image, price, col, effect, effectValue, target }})
    })()
}