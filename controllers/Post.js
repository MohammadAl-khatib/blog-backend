// const fs = require('fs');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post.js');

const secret = process.env.jwtSecret;

async function createPostController (req, res) {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary } = req.body;
    const postDoc = await Post.create({
      title,
      summary

    });
    res.json(postDoc);
  });
}

module.exports = createPostController;
