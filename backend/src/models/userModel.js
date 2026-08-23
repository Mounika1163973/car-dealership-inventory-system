const { db } = require('./db');

const UserModel = {
  create({ name, email, passwordHash, role = 'customer' }) {
    const stmt = db.prepare(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`
    );
    const info = stmt.run(name, email, passwordHash, role);
    return UserModel.findById(info.lastInsertRowid);
  },

  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findById(id) {
    return db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(id);
  },
};

module.exports = UserModel;
