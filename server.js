const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const fs = require('fs');

const app = express();

app.use(logger('dev'));
app.use(express.json());

require('dotenv').config();
require('./config/database');

const userRouter = require('./routes/api/users');
const cardRouter = require('./routes/api/pile');

// API routes
app.use('/api/users', userRouter);
app.use('/api/card', cardRouter);

// Check if we're in production (build folder exists)
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'build'));

if (isProduction) {
  // Production: Serve the React build (don't build on server)
  app.use(favicon(path.join(__dirname, 'build', 'favicon.ico')));
  app.use(express.static(path.join(__dirname, 'build')));
  
  app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
} else {
  // Development: Just serve API routes, let React dev server handle frontend
  app.get('/', function(req, res) {
    res.json({ message: 'MTG Pile API Server - Frontend running on React dev server' });
  });
}

const port = process.env.PORT || 3001;

app.listen(port, function() {
  console.log(`Express app running on port ${port}`)
});

