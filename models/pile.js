const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pileSchema = new mongoose.Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name: String,
  notes: String,
  cards: [{
    // Core card data from Scryfall
    id: String,
    name: String,
    mana_cost: String,
    cmc: Number,
    type_line: String,
    oracle_text: String,
    
    // Colors and identity
    colors: [String],
    color_identity: [String],
    
    // Card details
    power: String,
    toughness: String,
    loyalty: String,
    
    // Set information
    set: String,
    set_name: String,
    collector_number: String,
    rarity: String,
    
    // Artist and images
    artist: String,
    image_uris: {
      small: String,
      normal: String,
      large: String,
      png: String,
      art_crop: String,
      border_crop: String
    },
    
    // Purchase links
    purchase_uris: {
      tcgplayer: String,
      cardmarket: String,
      cardhoarder: String
    },
    
    // Prices
    prices: {
      usd: String,
      usd_foil: String,
      usd_etched: String,
      eur: String,
      eur_foil: String
    },
    
    // Additional useful data
    keywords: [String],
    legalities: Schema.Types.Mixed,
    released_at: String,
    scryfall_uri: String,
    tcgplayer_id: Number
  }]
},
  {
    timestamps: true
  });

module.exports = mongoose.model('Pile', pileSchema);