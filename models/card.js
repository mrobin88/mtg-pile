const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cardSchema = new Schema({
    apiUrl: String,
    name: String,
    imgUrl: String,
},
{
      timestamps: true
});

module.exports = mongoose.model('Card', eventSchema);