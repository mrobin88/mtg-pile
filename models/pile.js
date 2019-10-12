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
    name: String,
    manaCost: String,
    cmc: Number,
    colors: [String],
    colorIdentity: [String],
    type: String,
    supertypes: [String],
    types: [String],
    subtypes: [String],
    rarity: String,
    set: String,
    setName: String,
    flavor: String,
    artist: String,
    number: String,
    power: String,
    toughness: String,
    layout: String,
    multiverseid: Number,
    imageUrl: String,
    rulings: [String],
    printings: [String],
    originalType: String,
    id: String
  }]
},
  {
    timestamps: true
  });

module.exports = mongoose.model('Pile', pileSchema);