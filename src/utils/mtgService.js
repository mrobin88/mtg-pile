const mtg = require('mtgsdk')

const getCards = async (filterObj) => {
    return await mtg.card.where(filterObj)
    .then(cards => {
       return cards
    })
}

export default {
    getCards
}