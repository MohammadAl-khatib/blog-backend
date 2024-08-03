const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const registerController = require('./controllers/Register');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.mongoDB);

app.post('/register', registerController);

app.listen(4000, 'localhost', () => {
  console.log('server started successfully');
});
