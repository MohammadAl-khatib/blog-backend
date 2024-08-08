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

async function GetPostController (req, res) {
  try {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
  } catch (error) {
    console.error('Error in GetPostController', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function GetAllPostsController (req, res) {
  try {
    const posts = await Post.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
      .limit(20).lean();

    res.json(posts);
  } catch (error) {
    console.error('Error in GetAllPostsController', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function EditPostController (req, res) {
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
      const { id } = req.params;

      const postDoc = await Post.findById(id);
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json('you are not the author');
      }

      await Post.findOneAndUpdate({ _id: id }, {
        title,
        summary,
        content,
        cover: newPath || postDoc.cover
      });

      res.json(postDoc);
    });
  } catch (error) {
    console.error('Error in EditPostController', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function DeletePostController (req, res) {
  try {
    const { id } = req.params;
    await Post.findOneAndDelete({ _id: id });
    res.status(200).json({ message: 'document has been deleted' });
  } catch (error) {
    console.error('Error in DeletePostController', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  createPostController,
  GetPostController,
  GetAllPostsController,
  EditPostController,
  DeletePostController
};
