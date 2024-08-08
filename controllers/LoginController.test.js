const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const loginController = require('./LoginController');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/User', () => ({
  findOne: jest.fn()
}));

describe('loginController', () => {
  beforeEach(() => {
    // To suppress errors in console during testing
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  const req = {
    query: {
      username: 'mock user',
      password: 'mock password'
    }
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  it('should return 400 if username or password is invalid', async () => {
    User.findOne.mockResolvedValue(null);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid username or password' });
  });

  it('should return 400 if password is incorrect', async () => {
    User.findOne.mockResolvedValue({});
    bcrypt.compareSync.mockReturnValue(false);

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid username or password' });
  });

  it('should return 500 if jwt.sign fails', async () => {
    User.findOne.mockResolvedValue({});
    bcrypt.compareSync.mockReturnValue(true);
    jwt.sign.mockImplementation((payload, secret, options, callback) => {
      callback('mock JWT error');
    });

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('should return token and user data if login is successful', async () => {
    const mockToken = 'mockToken';
    User.findOne.mockResolvedValue({ _id: 'mock userId', username: 'mock user' });
    bcrypt.compareSync.mockReturnValue(true);
    jwt.sign.mockImplementation((payload, secret, options, callback) => {
      callback(null, mockToken);
    });

    await loginController(req, res);

    expect(res.cookie).toHaveBeenCalledWith('token', mockToken);
    expect(res.json).toHaveBeenCalledWith({ id: 'mock userId', username: 'mock user' });
  });

  it('should return 500 if an exception is thrown', async () => {
    User.findOne.mockRejectedValue(new Error('Database error'));

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
