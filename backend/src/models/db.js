/**
 * Database connection module.
 *
 * Uses better-sqlite3 to connect to a real, file-backed SQLite database
 * (never :memory:) so that data persists across process restarts, as
 * required by the kata. The test suite uses a separate on-disk file
 * (test.sqlite3) which is wiped between runs so tests stay isolated
 * without relying on an in-memory database.
 */
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const isTest = process.env.NODE_ENV === 'test';
const DB_FILENAME = isTest ? 'test.sqlite3' : 'dealership.sqlite3';
const DB_PATH = path.join(DATA_DIR, DB_FILENAME);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

/** Wipes all rows. Only ever used by the test suite between test files. */
function resetDb() {
  db.exec('DELETE FROM vehicles; DELETE FROM users;');
}

initSchema();

module.exports = { db, initSchema, resetDb, DB_PATH };
