const mongoose = require('mongoose')
const Schema = mongoose.Schema

const user = new Schema({
name: String,
email: String,
pass: String
},
{
timestamps: true
});

module.exports = mongoose.model('User', userSchema))