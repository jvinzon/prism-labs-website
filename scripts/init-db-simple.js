const { createDatabase } = require('../db');

async function initDatabase() {
  console.log('Initializing database with sql.js...');
  
  const db = await createDatabase();
  
  // Create tables
  console.log('Creating tables...');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'member'
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS xp_system (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      total_xp INTEGER DEFAULT 0,
      current_level INTEGER DEFAULT 1,
      weekly_xp INTEGER DEFAULT 0
    )
  `);
  
  // Insert test data
  console.log('Adding test data...');
  
  db.prepare(`INSERT OR IGNORE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)`).run(
    'admin-001', 'jedidiah@asdah.school.nz', 'Jedidiah Vinzon', 'admin'
  );
  
  db.prepare(`INSERT OR IGNORE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)`).run(
    'student-001', 'student@asdah.school.nz', 'Test Student', 'member'
  );
  
  db.prepare(`INSERT OR IGNORE INTO xp_system (id, user_id, total_xp, current_level) VALUES (?, ?, ?, ?)`).run(
    'xp-001', 'admin-001', 100, 2
  );
  
  db.prepare(`INSERT OR IGNORE INTO xp_system (id, user_id, total_xp, current_level) VALUES (?, ?, ?, ?)`).run(
    'xp-002', 'student-001', 50, 1
  );
  
  db.close();
  
  console.log('✅ Database initialized successfully!');
  console.log('Location: ./data/prism-labs.db');
  console.log('');
  console.log('Test users created:');
  console.log('  - jedidiah@asdah.school.nz (admin)');
  console.log('  - student@asdah.school.nz (member)');
}

initDatabase().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
