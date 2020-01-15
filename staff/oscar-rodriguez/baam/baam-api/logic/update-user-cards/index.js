const { validate, errors: { NotFoundError, ContentError } } = require('baam-util')
const { ObjectId, models: { User, Card } } = require('baam-data')
require('dotenv').config()

module.exports = function (userId, cards) {

    validate.string(userId)
    validate.string.notVoid('id', userId)
    if (!ObjectId.isValid(userId)) throw new ContentError(`${userId} is not a valid id`)
    userId = ObjectId(userId)

    validate.array(cards)
    if (cards.length <= 0) throw new ContentError(`can't add 0 or less cards`)

    return (async () => {
        const user = await User.findById(userId)
        if (!user) throw new NotFoundError (`user ${user} doesn't exist`)

        const cardIds = cards.map(card=>card.id)

        const _cards = await Card.find({"_id": { $in: cardIds}}).lean()
        _cards.forEach(card => {
            user.cards.push(card._id.toString())
        })
        user.lastReward = new Date()
        await user.save()
    })()
}