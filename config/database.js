const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
  
  ).catch(err => {
    console.log(err);
});

const db = mongoose.connection

db.on('connected', function(){
    console.log(`Connected to MongoDB at ${db.host}:${db.port} that contains ${db.modelNames.length} things`)
})

module.exports = mongoose

