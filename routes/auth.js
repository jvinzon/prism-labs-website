const express = require('express');
const router = express.Router();
const { createDatabase } = require('../db');
const { v4: uuidv4 } = require('uuid');

// Member login page
router.get('/members/login', (req, res) => {
  res.render('members/login', {
    title: 'Member Login - PRISM Labs'
  });
});

// Microsoft OAuth callback (placeholder)
router.get('/auth/microsoft', async (req, res) => {
  try {
    const db = await createDatabase();
    
    // Check if user exists, if not create them
    let testUser = db.prepare('SELECT * FROM users WHERE email = ?').get('student@asdah.school.nz');
    
    if (!testUser) {
      const userId = uuidv4();
      db.prepare(`
        INSERT INTO users (id, email, name, role)
        VALUES (?, 'student@asdah.school.nz', 'Test Student', 'member')
      `).run(userId);
      
      // Initialize XP
      db.prepare(`INSERT INTO xp_system (id, user_id) VALUES (?, ?)`).run(uuidv4(), userId);
      db.close();
      
      testUser = db.prepare('SELECT * FROM users WHERE email = ?').get('student@asdah.school.nz');
    }
    
    db.close();
    
    // Create session
    req.session.userId = testUser.id;
    req.session.user = testUser;
    req.session.role = 'member';
    
    req.flash('success', 'Welcome back, ' + testUser.name + '!');
    res.redirect('/members/dashboard');
  } catch (err) {
    console.error('Microsoft auth error:', err);
    req.flash('error', 'Login failed');
    res.redirect('/members/login');
  }
});

// Admin login page
router.get('/admin/login', (req, res) => {
  res.render('admin/login', {
    title: 'Admin Login - PRISM Labs'
  });
});

// Admin login POST (verify PIN)
router.post('/admin/login', async (req, res) => {
  try {
    const { email, pin } = req.body;
    
    // Check against environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'jedidiah@asdah.school.nz';
    const adminPin = process.env.ADMIN_PIN || '123456';
    
    if (email === adminEmail && pin === adminPin) {
      const db = await createDatabase();
      
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
  } catch (err) {
    console.error('Admin login error:', err);
    req.flash('error', 'Login failed');
    res.redirect('/admin/login');
  }
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
