const request = require('supertest');
const app = require('../src/app');
const { client } = require('../src/config/db');

beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  await client.end();
});

describe('User API', () => {
  it('should get all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should create a new user', async () => {
    const userData = {
      uid: 'test-uid',
      name: 'Test User',
      email: 'test@example.com'
    };

    const res = await request(app)
      .post('/users')
      .send(userData);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(userData.name);
  });
});
