// Database wrapper using sql.js (pure JavaScript SQLite)
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let dbInstance = null;
let SQL = null;

async function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }
  
  SQL = await initSqlJs();
  
  const dbPath = process.env.DATABASE_PATH || './data/prism-labs.db';
  const dbDir = path.dirname(dbPath);
  
  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Load existing database or create new
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }
  
  // Enable foreign keys
  dbInstance.run('PRAGMA foreign_keys = ON');
  
  return dbInstance;
}

// Helper to save database to file
async function saveDatabase() {
  if (!dbInstance) return;
  
  const dbPath = process.env.DATABASE_PATH || './data/prism-labs.db';
  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Wrapper functions that mimic better-sqlite3 API
class Database {
  constructor() {
    this.db = null;
  }
  
  async init() {
    this.db = await getDatabase();
    return this;
  }
  
  prepare(sql) {
    const db = this.db;
    
    return {
      run: (...params) => {
        try {
          db.run(sql, params);
          saveDatabase();
          return { changes: db.getRowsModified() };
        } catch (err) {
          throw err;
        }
      },
      
      get: (...params) => {
        try {
          const stmt = db.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        } catch (err) {
          throw err;
        }
      },
      
      all: (...params) => {
        try {
          const stmt = db.prepare(sql);
          stmt.bind(params);
          const results = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        } catch (err) {
          throw err;
        }
      }
    };
  }
  
  exec(sql) {
    try {
      this.db.run(sql);
      saveDatabase();
    } catch (err) {
      throw err;
    }
  }
  
  close() {
    if (this.db) {
      saveDatabase();
      this.db.close();
      dbInstance = null;
    }
  }
}

// Export functions similar to better-sqlite3
async function createDatabase() {
  const db = new Database();
  await db.init();
  return db;
}

module.exports = {
  getDatabase,
  saveDatabase,
  Database,
  createDatabase
};
