const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { JWT_SECRET } = require('../middleware/auth');

const SALT_ROUNDS = 10;

async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }

  const existing = UserModel.findByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  // Only allow the 'admin' role to be self-assigned for demo/testing convenience;
  // in a production system this would be gated behind an invite or admin action.
  const safeRole = role === 'admin' ? 'admin' : 'customer';

  const user = UserModel.create({ name, email, passwordHash, role: safeRole });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '2h',
  });

  return res.status(201).json({ user, token });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const record = UserModel.findByEmail(email);
  if (!record) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, record.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: record.id, email: record.email, role: record.role }, JWT_SECRET, {
    expiresIn: '2h',
  });

  const user = { id: record.id, name: record.name, email: record.email, role: record.role };
  return res.status(200).json({ user, token });
}

module.exports = { register, login };
