const bcrypt = require('bcryptjs');
const User = require('../models/User');

const registerController = require('./RegisterController');

jest.mock('bcryptjs');
jest.mock('../models/User', () => ({
    create: jest.fn()
  }));

describe('registerController', () => {
    let req;
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    beforeEach(() => {
         // To suppress errors in console during testing
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        req ={
            body: {
                username: 'mock username',
                password: 'mock password',
            }
        };
    })

    it('should return 400 if username or password is invalid', () => {
        req = { body: {}};

        registerController(req, res)

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'ValidationError',
            message: 'Username and password are required.'
        });
    });

    it('should return 201 and send user info to the client', async () => {
        User.create.mockImplementation(({ username, password }) => Promise.resolve({ username, password }));
        bcrypt.hashSync.mockReturnValue('hashed password')

        await registerController(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            username: 'mock username',
            password: 'hashed password',
        });
    });

    it('return 500 for internal server errors', async () => {
        User.create.mockRejectedValue({ message: 'mock error message' });

        await registerController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
             message: 'mock error message'
        });
    })

    it('notify users when a user is already registered', async () => {
        User.create.mockRejectedValue({ code: 11000 });

        await registerController(req, res);

        expect(res.json).toHaveBeenCalledWith({
            error: 'Duplicate Key',
            message: 'Username is already in use. Please choose a different username.',
        });
    })
});
