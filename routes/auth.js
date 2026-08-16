const express = require('express');
const router = express.Router();
const { createDatabase } = require('../db');
const { v4: uuidv4 } = require('uuid');

// Member login page (Microsoft OAuth redirect)
router.get('/members/login', (req, res) => {
  res.render('members/login', {
    title: 'Member Login - PRISM Labs'
  });
});

// Microsoft OAuth callback (placeholder - needs Azure setup)
router.get('/auth/microsoft', (req, res) => {
  // In production, this redirects to Microsoft OAuth
  // For now, create a test member session
  const db = createDatabase();
  
  // Check if user exists, if not create them
  const testUser = db.prepare('SELECT * FROM users WHERE email = ?').get('student@asdah.school.nz');
  
  if (!testUser) {
    const userId = uuidv4();
    db.prepare(`
      INSERT INTO users (id, email, name, role)
      VALUES (?, 'student@asdah.school.nz', 'Test Student', 'member')
    `).run(userId);
    
    // Initialize XP
    db.prepare(`INSERT INTO xp_system (id, user_id) VALUES (?, ?)`).run(uuidv4(), userId);
  }
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get('student@asdah.school.nz');
  db.close();
  
  // Create session
  req.session.userId = user.id;
  req.session.user = user;
  req.session.role = 'member';
  
  req.flash('success', 'Welcome back, ' + user.name + '!');
  res.redirect('/members/dashboard');
});

// Admin login page
router.get('/admin/login', (req, res) => {
  res.render('admin/login', {
    title: 'Admin Login - PRISM Labs'
  });
});

// Admin login POST (verify PIN)
router.post('/admin/login', (req, res) => {
  const { email, pin } = req.body;
  
  // Check against environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'jedidiah@asdah.school.nz';
  const adminPin = process.env.ADMIN_PIN || '123456';
  
  if (email === adminEmail && pin === adminPin) {
    const db = createDatabase();
    
    // Check if admin user exists in DB, if not create
    let adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!adminUser) {
      const userId = uuidv4();
      db.prepare(`
        INSERT INTO users (id, email, name, role)
        VALUES (?, ?, 'Admin User', 'admin')
      `).run(userId, email);
      
      adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }
    
    db.close();
    
    // Create admin session
    req.session.userId = adminUser.id;
    req.session.user = adminUser;
    req.session.role = 'admin';
    req.session.isAdmin = true;
    
    req.flash('success', 'Welcome, Admin!');
    return res.redirect('/admin/dashboard');
  }
  
  req.flash('error', 'Invalid credentials');
  res.redirect('/admin/login');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      req.flash('error', 'Logout failed');
      return res.redirect('/');
    }
    req.flash('success', 'Successfully logged out');
    res.redirect('/');
  });
});

module.exports = router;
