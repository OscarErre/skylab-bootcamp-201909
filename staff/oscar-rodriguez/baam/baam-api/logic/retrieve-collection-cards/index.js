const { validate , errors: { NotFoundError, ContentError } } = require('../../../baam-util')
const { ObjectId, models: { Card, Collection } } = require('../../../baam-data')

module.exports = function (id) {
    
    validate.string(id)
    validate.string.notVoid('id', id)

    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)
    id = ObjectId(id)

    return (async () => {    
        let cards = await Card.find({col: id}).lean()
            
        if (cards.length === 0) throw new NotFoundError(`there are no cards on this collection`)
        let cleanCards = []
        cards = await Collection.populate(cards, {path: 'col'})
        
        cards.forEach(card => {
            cleanCards.push({
                id: card._id.toString(),
                name: card.name,
                description: card.description,
                image: card.image,
                price: card.price,
                col: card.col.name,
                effect: card.effect,
                effectValue: card.effectValue,
                target: card.target
            })
        })
        return cleanCards
    })()

}