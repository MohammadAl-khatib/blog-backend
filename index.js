const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  try {
    const response = {
      username, password
    };
    res.json(response);
  } catch (e) {
    console.log('error in registering user', e.message);
  }
});

app.listen(4000, 'localhost', () => {
  console.log('server started successfully');
});
