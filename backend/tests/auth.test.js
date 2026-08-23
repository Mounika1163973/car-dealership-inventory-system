const request = require('supertest');
const app = require('../src/app');
const { resetDb } = require('../src/models/db');

beforeEach(() => {
  resetDb();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ name: 'Jane Doe', email: 'jane@example.com', role: 'customer' });
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('allows registering an admin user via the role field', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('admin');
  });

  it('rejects registration with a missing field', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'incomplete@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it('rejects a password shorter than 6 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Short Pass',
      email: 'short@example.com',
      password: '123',
    });

    expect(res.status).toBe(400);
  });

  it('rejects duplicate emails', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'dupe@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe Again',
      email: 'dupe@example.com',
      password: 'password456',
    });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User',
      email: 'login@example.com',
      password: 'correct-password',
    });
  });

  it('logs in with correct credentials and returns a token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'correct-password',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe('login@example.com');
  });

  it('rejects an incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
  });

  it('rejects a non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'whatever',
    });

    expect(res.status).toBe(401);
  });
});
