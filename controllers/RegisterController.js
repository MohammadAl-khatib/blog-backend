const User = require('../models/User');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);


async function registerController (req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Username and password are required.'
    });
  }

  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt)
    });
    res.status(201).json(userDoc);
  } catch (e) {
    console.error('error in registering user', e.message);

    if (e.code === 11000) {
      res.json({
        error: 'Duplicate Key',
        message: 'Username is already in use. Please choose a different username.',
      });
    } else {
      res.status(500).json(e);
    }
  }
}

module.exports = registerController;
