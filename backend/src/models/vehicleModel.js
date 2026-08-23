const { db } = require('./db');

const VehicleModel = {
  create({ make, model, category, price, quantity }) {
    const stmt = db.prepare(
      `INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)`
    );
    const info = stmt.run(make, model, category, price, quantity);
    return VehicleModel.findById(info.lastInsertRowid);
  },

  findAll() {
    return db.prepare('SELECT * FROM vehicles ORDER BY id DESC').all();
  },

  findById(id) {
    return db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
  },

  search({ make, model, category, minPrice, maxPrice }) {
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];

    if (make) {
      query += ' AND make LIKE ?';
      params.push(`%${make}%`);
    }
    if (model) {
      query += ' AND model LIKE ?';
      params.push(`%${model}%`);
    }
    if (category) {
      query += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }
    if (minPrice !== undefined) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }
    if (maxPrice !== undefined) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }

    query += ' ORDER BY id DESC';
    return db.prepare(query).all(...params);
  },

  update(id, fields) {
    const existing = VehicleModel.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...fields };
    db.prepare(
      `UPDATE vehicles SET make = ?, model = ?, category = ?, price = ?, quantity = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(updated.make, updated.model, updated.category, updated.price, updated.quantity, id);

    return VehicleModel.findById(id);
  },

  delete(id) {
    const info = db.prepare('DELETE FROM vehicles WHERE id = ?').run(id);
    return info.changes > 0;
  },

  /** Decrease quantity by `amount`. Throws if insufficient stock. */
  purchase(id, amount = 1) {
    const vehicle = VehicleModel.findById(id);
    if (!vehicle) return null;
    if (vehicle.quantity < amount) {
      const err = new Error('Insufficient stock');
      err.code = 'INSUFFICIENT_STOCK';
      throw err;
    }
    db.prepare(`UPDATE vehicles SET quantity = quantity - ?, updated_at = datetime('now') WHERE id = ?`).run(
      amount,
      id
    );
    return VehicleModel.findById(id);
  },

  /** Increase quantity by `amount`. */
  restock(id, amount = 1) {
    const vehicle = VehicleModel.findById(id);
    if (!vehicle) return null;
    db.prepare(`UPDATE vehicles SET quantity = quantity + ?, updated_at = datetime('now') WHERE id = ?`).run(
      amount,
      id
    );
    return VehicleModel.findById(id);
  },
};

module.exports = VehicleModel;
