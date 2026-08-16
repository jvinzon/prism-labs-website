const { createDatabase } = require('./db');

async function initDatabase() {
  console.log('Initializing PRISM Labs database...');
  
  const db = await createDatabase();
  
  console.log('Creating tables...');
  
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      year_level TEXT,
      avatar_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // XP System tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS xp_system (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      total_xp INTEGER DEFAULT 0,
      current_level INTEGER DEFAULT 1,
      weekly_xp INTEGER DEFAULT 0,
      last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS xp_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      xp_amount INTEGER NOT NULL,
      transaction_type TEXT NOT NULL,
      activity_type TEXT,
      related_id TEXT,
      reason TEXT,
      admin_user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS xp_caps (
      id TEXT PRIMARY KEY,
      activity_type TEXT UNIQUE NOT NULL,
      daily_cap INTEGER,
      weekly_cap INTEGER
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS levels (
      level_number INTEGER PRIMARY KEY,
      name_english TEXT NOT NULL,
      name_te_reo TEXT NOT NULL,
      min_xp INTEGER NOT NULL,
      badge_icon TEXT,
      badge_color TEXT,
      perks TEXT
    )
  `);
  
  // Teams tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT,
      term_points INTEGER DEFAULT 0,
      total_points INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_teams (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      team_id TEXT NOT NULL,
      term_joined TEXT NOT NULL,
      is_captain INTEGER DEFAULT 0,
      can_change_team INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (team_id) REFERENCES teams(id)
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS team_points_log (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      points INTEGER NOT NULL,
      activity_type TEXT,
      related_id TEXT,
      term TEXT,
      year INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    )
  `);
  
  // Challenges tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      challenge_type TEXT DEFAULT 'weekly',
      difficulty TEXT DEFAULT 'medium',
      target_value INTEGER DEFAULT 1,
      track_metric TEXT,
      xp_reward INTEGER NOT NULL,
      badge_id TEXT,
      auto_track INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      start_date DATE,
      end_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_challenges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      status TEXT DEFAULT 'available',
      progress INTEGER DEFAULT 0,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (challenge_id) REFERENCES challenges(id)
    )
  `);
  
  // Badges tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      category TEXT,
      xp_requirement INTEGER DEFAULT 0
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      earned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      context TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (badge_id) REFERENCES badges(id)
    )
  `);
  
  // Shop tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS shop_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      item_type TEXT NOT NULL,
      xp_cost INTEGER NOT NULL,
      quantity_available INTEGER,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_purchases (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      xp_spent INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      delivered_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (item_id) REFERENCES shop_items(id)
    )
  `);
  
  // Resources tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS learning_resources (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      track TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      difficulty TEXT DEFAULT 'beginner',
      is_free INTEGER DEFAULT 1,
      free_tier INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      tags TEXT,
      views_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS resource_bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (resource_id) REFERENCES learning_resources(id)
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS resource_suggestions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      category TEXT,
      track TEXT,
      status TEXT DEFAULT 'pending',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // Bookings tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookable_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      item_type TEXT NOT NULL,
      description TEXT,
      available_quantity INTEGER DEFAULT 1,
      requires_approval INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      purpose TEXT,
      status TEXT DEFAULT 'pending',
      approved_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (item_id) REFERENCES bookable_items(id)
    )
  `);
  
  // Social tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      original_post_id TEXT,
      is_deleted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_likes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      parent_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )
  `);
  
  console.log('Tables created. Seeding initial data...');
  
  // Seed levels (10 levels with Te Reo names)
  const levels = [
    [1, 'Beginning', 'Tīmatanga', 0, '🌱', '#10B981', 'Basic access'],
    [2, 'Learner', 'Kaiako', 150, '📚', '#3B82F6', 'Book equipment'],
    [3, 'Builder', 'Kaihanga', 400, '🔨', '#F97316', 'Advanced resources'],
    [4, 'Helper', 'Āwhina', 750, '🤝', '#8B5CF6', 'Forum moderator'],
    [5, 'Innovator', 'Pūtaiao', 1200, '💡', '#EC4899', 'Lead projects'],
    [6, 'Leader', 'Kaiarahi', 1800, '🎯', '#10B981', 'Team leader'],
    [7, 'Expert', 'Tohunga-ā-Whare', 2600, '🏆', '#3B82F6', 'Represent school'],
    [8, 'Master', 'Tohunga', 3600, '⭐', '#F97316', 'PRISM Fellow'],
    [9, 'Guardian', 'Kaitiaki', 5000, '🛡️', '#8B5CF6', 'Governance input'],
    [10, 'Pillar', 'Pou Tokomanawa', 7000, '👑', '#EC4899', 'Hall of Fame']
  ];
  
  levels.forEach(level => {
    db.prepare(`
      INSERT OR IGNORE INTO levels (level_number, name_english, name_te_reo, min_xp, badge_icon, badge_color, perks)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(...level);
  });
  
  // Seed teams (5 PRISM teams)
  const teams = [
    ['P', 'Programming', 'Code, software, AI/ML', '#3B82F6'],
    ['R', 'Refurbishing', 'Hardware, sustainability', '#8B5CF6'],
    ['I', 'Innovation', 'Design, prototyping', '#10B981'],
    ['S', 'Systems', 'IoT, networks, automation', '#F97316'],
    ['M', 'Media', 'Content, video, design', '#EC4899']
  ];
  
  teams.forEach(team => {
    db.prepare(`
      INSERT OR IGNORE INTO teams (id, code, name, description, color)
      VALUES (?, ?, ?, ?, ?)
    `).run('team-' + team[0], ...team);
  });
  
  // Seed XP caps
  const caps = [
    ['attendance', 20, 100],
    ['social_post', 15, 50],
    ['forum_help', 30, 150],
    ['challenge', 100, 300]
  ];
  
  caps.forEach(cap => {
    db.prepare(`
      INSERT OR IGNORE INTO xp_caps (id, activity_type, daily_cap, weekly_cap)
      VALUES (?, ?, ?, ?)
    `).run('cap-' + cap[0], ...cap);
  });
  
  // Create admin user
  const adminId = 'admin-001';
  db.prepare(`
    INSERT OR IGNORE INTO users (id, email, name, role)
    VALUES (?, 'jedidiah@asdah.school.nz', 'Jedidiah Vinzon', 'admin')
  `).run(adminId);
  
  // Initialize admin XP
  db.prepare(`
    INSERT OR IGNORE INTO xp_system (id, user_id, total_xp, current_level)
    VALUES (?, ?, 100, 2)
  `).run('xp-admin', adminId);
  
  // Create test student
  const studentId = 'student-001';
  db.prepare(`
    INSERT OR IGNORE INTO users (id, email, name, role)
    VALUES (?, 'student@asdah.school.nz', 'Test Student', 'member')
  `).run(studentId);
  
  db.prepare(`
    INSERT OR IGNORE INTO xp_system (id, user_id, total_xp, current_level)
    VALUES (?, ?, 50, 1)
  `).run('xp-student', studentId);
  
  // Seed shop items
  const shopItems = [
    ['PRISM Sticker Pack', 'Cool PRISM Labs stickers', 'digital', 100, null, 1],
    ['Priority Booking Pass', 'Skip the line for equipment', 'privilege', 250, null, 2],
    ['Mentor Session', '1-on-1 with teacher', 'privilege', 150, null, 3],
    ['PRISM T-Shirt', 'Official PRISM Labs t-shirt', 'physical', 500, 20, 4],
    ['Competition Priority', 'Priority for competitions', 'privilege', 300, null, 5],
    ['PRISM Hoodie', 'Official PRISM Labs hoodie', 'physical', 800, 10, 6],
    ['Pizza Party Voucher', 'Pizza for your team', 'physical', 600, 5, 7]
  ];
  
  shopItems.forEach((item, index) => {
    db.prepare(`
      INSERT OR IGNORE INTO shop_items (id, name, description, item_type, xp_cost, quantity_available, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('shop-' + (index + 1), ...item);
  });
  
  db.close();
  
  console.log('');
  console.log('✅ Database initialized successfully!');
  console.log('');
  console.log('📊 Tables created: 20+');
  console.log('📊 Levels seeded: 10 (with Te Reo names)');
  console.log('📊 Teams seeded: 5 (P-R-I-S-M)');
  console.log('📊 Shop items seeded: 7');
  console.log('');
  console.log('👤 Test Users:');
  console.log('   Admin: jedidiah@asdah.school.nz (PIN: 123456)');
  console.log('   Student: student@asdah.school.nz');
  console.log('');
  console.log('🚀 Now restart the server: node server.js');
}

initDatabase().catch(err => {
  console.error('Error initializing database:', err);
  process.exit(1);
});
