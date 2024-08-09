const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const multer = require('multer'); // for loading files
const jwt = require('jsonwebtoken');
const path = require('path');

require('dotenv').config();

const RegisterController = require('./controllers/RegisterController');
const LoginController = require('./controllers/LoginController');
const { CreatePostController, GetPostController, GetAllPostsController, EditPostController, DeletePostController } = require('./controllers/PostController');

const uploadMiddleware = multer({ dest: 'uploads/' });
const app = express();
const whitelist = ['http://localhost:3000', 'https://blog-house.netlify.app'];

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
app.post('/register', RegisterController);
app.get('/login', LoginController);
app.post('/post', uploadMiddleware.single('file'), CreatePostController);
app.get('/post/:id', GetPostController);
app.get('/posts', GetAllPostsController);
app.put('/edit/:id', uploadMiddleware.single('file'), EditPostController);
app.delete('/delete/:id', DeletePostController);

// Control verifying and setting cookie
const secret = process.env.jwtSecret;

app.get('/profile', (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json({ message: 'user is not logged in' });
  }
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;
    res.status(200).json(info);
  });
});

app.post('/logout', (req, res) => {
  res.cookie('token', '', { sameSite: 'None', secure: true }).json('ok');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening to port ${PORT}`);
});
