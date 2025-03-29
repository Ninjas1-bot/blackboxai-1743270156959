const Database = require('better-sqlite3');

// Initialize database
const db = new Database('locations.db');

// Create locations table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Prepare statements for CRUD operations
const stmts = {
  insertLocation: db.prepare(`
    INSERT INTO locations (latitude, longitude)
    VALUES (?, ?)
  `),
  getLocations: db.prepare(`
    SELECT * FROM locations
    ORDER BY timestamp DESC
  `),
  clearLocations: db.prepare(`
    DELETE FROM locations
  `)
};

module.exports = { db, stmts };