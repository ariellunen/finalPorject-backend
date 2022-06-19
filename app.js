const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const drawingRoutes = require('./routes/drawing-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
const logger = require('morgan');

const fs = require('fs');
const path = require('path')
const app = express();

app.use(bodyParser.json({ limit: '5MB', extended: true, parameterLimit: 50000 }));

app.use('\\uploads\\images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Access, Authorization, X-Api-Key, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next();
});

app.use('/api/drawing', drawingRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err)
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jagbi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
  .then(() => {
    app.listen(process.env.PORT || 3001);
  })

  .catch(err => {
    console.log(err);
  });

