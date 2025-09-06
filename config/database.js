const mongoose = require('mongoose');

// Use MONGODB_URI for production (Atlas) or DATABASE_URL for local development
const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/mtg-pile';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => {
    console.log('MongoDB connection error:', err);
});

const db = mongoose.connection;

db.on('connected', function(){
    console.log(`Connected to MongoDB at ${db.host}:${db.port} that contains ${db.modelNames.length} things`);
});

db.on('error', function(err){
    console.log('MongoDB error:', err);
});

module.exports = mongoose;

