const express = require('express');
const router = express.Router();
const { createDatabase } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Admin dashboard
router.get('/dashboard', async (req, res) => {
  // Check if user is admin
  if (!req.session || !req.session.isAdmin) {
    req.flash('error', 'Admin access required');
    return res.redirect('/admin/login');
  }
  
  try {
    const db = await createDatabase();
    
    // Get stats
    const stats = {
      totalMembers: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('member').count || 0,
      activeThisWeek: db.prepare(`
        SELECT COUNT(DISTINCT user_id) as count FROM xp_transactions 
        WHERE created_at > datetime('now', '-7 days')
      `).get().count || 0,
      pendingBookings: db.prepare(`
        SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'
      `).get().count || 0,
      pendingResources: db.prepare(`
        SELECT COUNT(*) as count FROM resource_suggestions WHERE status = 'pending'
      `).get().count || 0
    };
    
    db.close();
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard - PRISM Labs',
      user: req.session.user,
      stats
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).send('Error loading dashboard: ' + err.message);
  }
});

// User management
router.get('/users', async (req, res) => {
  if (!req.session || !req.session.isAdmin) {
    return res.redirect('/admin/login');
  }
  
  try {
    const db = await createDatabase();
    const users = db.prepare(`
      SELECT u.*, x.total_xp, x.current_level
      FROM users u
      LEFT JOIN xp_system x ON u.id = x.user_id
      ORDER BY u.created_at DESC
    `).all();
    db.close();
    
    res.render('admin/users', {
      title: 'User Management - PRISM Labs',
      users
    });
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Resource approval
router.get('/resources', async (req, res) => {
  if (!req.session || !req.session.isAdmin) {
    return res.redirect('/admin/login');
  }
  
  try {
    const db = await createDatabase();
    const suggestions = db.prepare(`
      SELECT s.*, u.name as submitter_name
      FROM resource_suggestions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.status = 'pending'
      ORDER BY s.created_at DESC
    `).all();
    db.close();
    
    res.render('admin/resources', {
      title: 'Resource Approval - PRISM Labs',
      suggestions
    });
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Booking management
router.get('/bookings', async (req, res) => {
  if (!req.session || !req.session.isAdmin) {
    return res.redirect('/admin/login');
  }
  
  try {
    const db = await createDatabase();
    const bookings = db.prepare(`
      SELECT b.*, u.name as user_name, bi.name as item_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN bookable_items bi ON b.item_id = bi.id
      WHERE b.status = 'pending'
      ORDER BY b.start_time ASC
    `).all();
    db.close();
    
    res.render('admin/bookings', {
      title: 'Booking Management - PRISM Labs',
      bookings
    });
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

module.exports = router;
