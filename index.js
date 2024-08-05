const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const multer = require('multer'); // for loading files
const path = require('path');

require('dotenv').config();

const registerController = require('./controllers/RegisterController');
const loginController = require('./controllers/LoginController');
const { createPostController, GetPostController, GetAllPostsController, EditPostController } = require('./controllers/PostController');

const uploadMiddleware = multer({ dest: 'uploads/' });
const app = express();
const whitelist = ['http://localhost:3000'];

app.use(express.json());
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    // Added !origin to allow for NextJS server to hit this server
    if (!origin || whitelist.includes(origin)) { return callback(null, true); }
  }
}));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

mongoose.connect(process.env.mongoDB);

// Endpoints
app.post('/register', registerController);
app.get('/login', loginController);
app.post('/post', uploadMiddleware.single('file'), createPostController);
app.get('/post/:id', GetPostController);
app.get('/posts', GetAllPostsController);
app.put('/edit/:id', uploadMiddleware.single('file'), EditPostController);

app.listen(4000, 'localhost', () => {
  console.log('server started successfully');
});
