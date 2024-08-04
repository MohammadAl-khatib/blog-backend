const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const registerController = require('./controllers/Register');
const loginController = require('./controllers/Login');

const app = express();
const whitelist = ['http://localhost:3000'];

app.use(express.json());
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (whitelist.includes(origin)) { return callback(null, true); }
  }
}));

mongoose.connect(process.env.mongoDB);

// Endpoints
app.post('/register', registerController);
app.get('/login', loginController);

app.listen(4000, 'localhost', () => {
  console.log('server started successfully');
});
