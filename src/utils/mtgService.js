const mtg = require('mtgsdk')

const getCards = async (filterObj) => {
    return await mtg.card.where(filterObj)
    .then(cards => {
       return cards
    }).catch(err => console.log(err))
}

export default {
    getCards
}