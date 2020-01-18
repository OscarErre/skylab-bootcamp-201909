const { validate, errors: { NotFoundError, ContentError } } = require('baam-util')
const { ObjectId, models: { Card } } = require('baam-data')

module.exports = function (id) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    return (async () => {
        const card = await Card.findById(id)

        if (!card) throw new NotFoundError(`card with id ${id} not found`)

        const { name, description, image, price, col, effect, effectValue, target } = card.toObject()

        return { id, name, description, image, price, col, effect, effectValue, target }
    })()
}