const fs = require('fs');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post.js');
const { createPostController } = require('./PostController.js');

jest.mock('jsonwebtoken');
jest.mock('../models/Post', () => ({
  create: jest.fn(),
  findById: jest.fn().mockImplementation(() => ({ populate: jest.fn() })),
  find: jest.fn().mockImplementation(() => ({
    populate: () => ({
      sort: () => ({
        limit: () => ({
          lean: () => Promise.resolve({})
        })
      })
    })
  })),
  findOneAndUpdate: jest.fn()
}));

describe('PostController', () => {
  const req = {
    file: 'mock file',
    cookies: 'mock cookies',
    params: {}
  };

  describe('createPostController', () => {

  });
});
