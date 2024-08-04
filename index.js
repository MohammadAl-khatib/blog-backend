const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const multer = require('multer'); // for loading files

require('dotenv').config();

const registerController = require('./controllers/RegisterController');
const loginController = require('./controllers/LoginController');
const { createPostController } = require('./controllers/PostController');
const uploadMiddleware = multer({ dest: 'uploads/' });

const app = express();
const whitelist = ['http://localhost:3000'];

app.use(express.json());
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (whitelist.includes(origin)) { return callback(null, true); }
  }
}));
app.use(cookieParser());

mongoose.connect(process.env.mongoDB);

// Endpoints
app.post('/register', registerController);
app.get('/login', loginController);
app.post('/post', uploadMiddleware.single('file'), createPostController);

app.listen(4000, 'localhost', () => {
  console.log('server started successfully');
});
