const fs = require('fs');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post.js');

const secret = process.env.jwtSecret;

async function createPostController (req, res) {
  try {
    const { originalname, path } = req.file || {};

    let newPath;
    if (originalname) {
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path + '.' + ext;
      fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (error, info) => {
      if (error) {
        console.error('Error verifying token:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      const { title, summary, content } = req.body;
      const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author: info.id
      });
      res.json(postDoc);
    });
  } catch (error) {
    console.error('Error in createPostController', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createPostController };
