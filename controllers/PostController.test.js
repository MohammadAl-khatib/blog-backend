const jwt = require('jsonwebtoken');
const Post = require('../models/Post.js');
const {
  CreatePostController,
  GetPostController,
  GetAllPostsController,
  EditPostController,
  DeletePostController
} = require('./PostController.js');

jest.mock('jsonwebtoken');
jest.mock('fs');
jest.mock('../models/Post', () => ({
  create: jest.fn(),
  findById: jest.fn().mockImplementation(() => ({ populate: jest.fn().mockReturnValue({}) })),
  find: jest.fn().mockImplementation(() => ({
    populate: () => ({
      sort: () => ({
        limit: () => ({
          lean: () => Promise.resolve(['mock 1/\'st document', 'mock 2/\'nd document'])
        })
      })
    })
  })),
  findOneAndUpdate: jest.fn().mockResolvedValue({ title: 'mock title' }),
  findOneAndDelete: jest.fn()
}));

describe('PostController', () => {
  let req;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  beforeEach(() => {
    // To suppress errors in console during testing
    jest.spyOn(console, 'error').mockImplementation(() => {});

    req = {
      file: {
        originalname: 'mock.original.cover.file.name.jpg',
        path: 'mockPath'
      },
      body: {
        username: 'mock username',
        password: 'mock password'
      },
      cookies: { cookies: 'mock cookie' },
      params: { id: 'mock id' }
    };
  });

  describe('CreatePostController', () => {
    it('creates a post', async () => {
      jwt.verify.mockImplementation((token, secret, options, callback) => {
        callback(null, { id: 'mock id' });
      });
      Post.create.mockResolvedValue(({ document: 'mock document' }));

      await CreatePostController(req, res);

      expect(res.json).toHaveBeenCalledWith({ document: 'mock document' });
    });

    it('creates a post even if no cover file is provided', async () => {
      jwt.verify.mockImplementation((token, secret, options, callback) => {
        callback(null, { id: 'mock id' });
      });
      Post.create.mockResolvedValue(({ document: 'mock document' }));
      req.file = undefined;

      await CreatePostController(req, res);

      expect(res.json).toHaveBeenCalledWith({ document: 'mock document' });
    });

    it('returns 500 status code when user is not verified', async () => {
      jwt.verify.mockImplementation((token, secret, options, callback) => {
        callback(new Error('mock error message'));
      });

      await CreatePostController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });

    it('returns 500 status code when database fails to create a post', async () => {
      req.file.originalname = {};

      await CreatePostController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error'
      });
    });
  });

  describe('GetPostController', () => {
    it('returns a document', async () => {
      await GetPostController(req, res);
      expect(res.json).toHaveBeenCalledWith({});
    });

    it('responds with 500 status code for database errors', async () => {
      Post.findById.mockResolvedValue(new Error('database error'));
      await GetPostController(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('GetAllPostsController', () => {
    it('returns 20 documents from database', async () => {
      await GetAllPostsController(req, res);
      expect(res.json).toHaveBeenCalledWith(['mock 1/\'st document', 'mock 2/\'nd document']);
    });

    it('responds with 500 status code for database errors', async () => {
      Post.find.mockResolvedValue(new Error('database error'));
      await GetAllPostsController(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('EditPostController', () => {
    it('responds with updated document data for successful update', async () => {
      jwt.verify.mockImplementation((token, secret, options, callback) => {
        callback(null, { id: 'mock author id' });
      });
      Post.findById.mockResolvedValue({ author: 'mock author id' });

      await EditPostController(req, res);

      expect(Post.findOneAndUpdate).toHaveBeenCalledWith({
        _id: 'mock id'
      },
      { content: undefined, cover: 'mockPath.jpg', summary: undefined, title: undefined });
    });

    it('responds with updated document data for successful update with no cover file', async () => {
      jwt.verify.mockImplementation((token, secret, options, callback) => {
        callback(null, { id: 'mock author id' });
      });
      Post.findById.mockResolvedValue({ author: 'mock author id' });
      req.file = undefined;

      await EditPostController(req, res);

      expect(Post.findOneAndUpdate).toHaveBeenCalledWith({
        _id: 'mock id'
      },
      { content: undefined, cover: undefined, summary: undefined, title: undefined });
    });

    it('returns status 400 when author is not allowed to edit', async () => {
      jwt.verify.mockImplementation((token, secret, options, callback) => {
        callback(null, { id: 'mock author id 2' });
      });
      Post.findById.mockResolvedValue({ author: 'mock author id' });

      await EditPostController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith('you are not the author');
    });

    it('returns status 400 when author is not verified', async () => {
      jwt.verify.mockImplementation((token, secret, options, callback) => {
        callback(new Error(''));
      });
      Post.findById.mockResolvedValue({ author: 'mock author id' });

      await EditPostController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('returns status 500 for other errors', async () => {
      req.file.originalname = {};

      await EditPostController(req, res);

      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('DeletePostController', () => {
    it('deletes post by id', async () => {
      await DeletePostController(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'document has been deleted' });
    });

    it('returns 500 for internal server error', async () => {
      Post.findOneAndDelete.mockRejectedValue(new Error('database error'));
      await DeletePostController(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
