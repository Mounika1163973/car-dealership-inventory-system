const request = require('supertest');
const app = require('../src/app');
const { resetDb } = require('../src/models/db');

let customerToken;
let adminToken;

async function registerAndLogin(overrides = {}) {
  const payload = {
    name: 'Test User',
    email: 'user@example.com',
    password: 'password123',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return res.body.token;
}

beforeEach(async () => {
  resetDb();
  customerToken = await registerAndLogin({ email: 'customer@example.com', role: 'customer' });
  adminToken = await registerAndLogin({ email: 'admin@example.com', role: 'admin' });
});

describe('Vehicle routes authentication', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('rejects requests with an invalid token', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/vehicles', () => {
  it('creates a new vehicle when authenticated', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 });
    expect(res.body.id).toEqual(expect.any(Number));
  });

  it('rejects an invalid payload', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ make: 'Toyota' });

    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});

describe('GET /api/vehicles', () => {
  it('returns all vehicles', async () => {
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 21000, quantity: 3 });

    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });
});

describe('GET /api/vehicles/search', () => {
  beforeEach(async () => {
    const vehicles = [
      { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 },
      { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 28000, quantity: 2 },
      { make: 'Ford', model: 'Mustang', category: 'Sports', price: 45000, quantity: 1 },
    ];
    for (const v of vehicles) {
      await request(app).post('/api/vehicles').set('Authorization', `Bearer ${adminToken}`).send(v);
    }
  });

  it('filters by make', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('filters by category', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?category=SUV')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].model).toBe('RAV4');
  });

  it('filters by price range', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?minPrice=25000&maxPrice=50000')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });
});

describe('PUT /api/vehicles/:id', () => {
  it('updates a vehicle', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Kia', model: 'Sportage', category: 'SUV', price: 26000, quantity: 4 });

    const res = await request(app)
      .put(`/api/vehicles/${created.body.id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ price: 24999 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(24999);
  });

  it('returns 404 for a non-existent vehicle', async () => {
    const res = await request(app)
      .put('/api/vehicles/999999')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ price: 1000 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/vehicles/:id', () => {
  it('allows an admin to delete a vehicle', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Mazda', model: 'CX-5', category: 'SUV', price: 27000, quantity: 2 });

    const res = await request(app)
      .delete(`/api/vehicles/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('forbids a non-admin from deleting a vehicle', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Mazda', model: 'CX-5', category: 'SUV', price: 27000, quantity: 2 });

    const res = await request(app)
      .delete(`/api/vehicles/${created.body.id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });
});

describe('POST /api/vehicles/:id/purchase', () => {
  it('decreases quantity by 1 by default', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Subaru', model: 'Outback', category: 'SUV', price: 30000, quantity: 3 });

    const res = await request(app)
      .post(`/api/vehicles/${created.body.id}/purchase`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(2);
  });

  it('rejects a purchase that exceeds available stock', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Subaru', model: 'Outback', category: 'SUV', price: 30000, quantity: 1 });

    const res = await request(app)
      .post(`/api/vehicles/${created.body.id}/purchase`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ amount: 5 });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/vehicles/:id/restock', () => {
  it('allows an admin to increase quantity', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Jeep', model: 'Wrangler', category: 'SUV', price: 35000, quantity: 0 });

    const res = await request(app)
      .post(`/api/vehicles/${created.body.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 4 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(4);
  });

  it('forbids a non-admin from restocking', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Jeep', model: 'Wrangler', category: 'SUV', price: 35000, quantity: 0 });

    const res = await request(app)
      .post(`/api/vehicles/${created.body.id}/restock`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ amount: 4 });

    expect(res.status).toBe(403);
  });
});
