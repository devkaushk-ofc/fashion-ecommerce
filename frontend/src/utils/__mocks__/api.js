// Auto-mock for src/utils/api.js
// When a test calls jest.mock('../../utils/api'), Jest uses this file.
const api = {
  get:    jest.fn(),
  post:   jest.fn(),
  put:    jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request:  { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

export default api;
