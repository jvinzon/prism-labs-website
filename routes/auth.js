const express = require('express');
const router = express.Router();
const passport = require('passport');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Login page
router.get('/login', (req, res) => {
  if (req.user) {
    return res.redirect('/members/dashboard');
  }
  res.render('auth/login', {
    title: 'Login - PRISM Labs'
  });
});

// Microsoft OAuth
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['openid', 'profile', 'email'] }));

router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/auth/login', failureFlash: true }),
  (req, res) => {
    req.flash('success', `Welcome back, ${req.user.name}!`);
    res.redirect(req.user.role === 'admin' ? '/admin/dashboard' : '/members/dashboard');
  }
);

// Manual registration (for non-M365 users)
router.post('/register', async (req, res) => {
  try {
    const { email, name, year_level } = req.body;
    
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      req.flash('error', 'Email already registered');
      return res.redirect('/auth/login');
    }
    
    const userId = uuidv4();
    db.prepare(`
      INSERT INTO users (id, email, name, year_level, role)
      VALUES (?, ?, ?, ?, 'member')
    `).run(userId, email, name, parseInt(year_level) || null);
    
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error', 'Registration failed');
    res.redirect('/auth/login');
  }
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'You have been logged out');
    res.redirect('/');
  });
});

module.exports = router;
