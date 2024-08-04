const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const secret = process.env.jwtSecret;

async function loginController (req, res) {
  try {
    const { username, password } = req.query;
    const userDoc = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, userDoc?.password || '');

    if (!userDoc || !passOk) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) {
        console.error('Error generating token:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.cookie('token', token).json({
        id: userDoc._id,
        username
      });
    });
  } catch (err) {
    console.error('Error in loginController:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = loginController;
