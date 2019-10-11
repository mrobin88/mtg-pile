const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pileSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name: String,
  notes: String,
  cards:[{
    type: Schema.Types.ObjectId,
    ref: 'Card'
    }]
    },
    {
      timestamps: true
});

module.exports = mongoose.model('Pile', eventSchema);