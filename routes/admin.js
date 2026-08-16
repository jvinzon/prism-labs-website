const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Dashboard
router.get('/dashboard', (req, res) => {
  const stats = {
    totalMembers: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "member"').get().count,
    activeProjects: db.prepare('SELECT COUNT(*) as count FROM projects WHERE status = "active"').get().count,
    eventsThisTerm: db.prepare('SELECT COUNT(*) as count FROM events WHERE start_time >= date("now", "start of year")').get().count,
    attendanceRate: db.prepare('SELECT ROUND(AVG(present) * 100.0 / total, 1) as rate FROM (SELECT COUNT(*) as total, SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present FROM attendance GROUP BY event_id)').get(),
    budgetSpent: db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status = "approved"').get().total,
    inventoryItems: db.prepare('SELECT COUNT(*) as count FROM inventory_items').get().count
  };
  
  const recentActivity = db.prepare(`
    SELECT 'attendance' as type, a.*, u.name, e.title as event_title
    FROM attendance a
    JOIN users u ON a.user_id = u.id
    JOIN events e ON a.event_id = e.id
    ORDER BY a.check_in_time DESC LIMIT 10
  `).all();
  
  res.render('admin/dashboard', {
    title: 'Admin Dashboard - PRISM Labs',
    stats,
    recentActivity
  });
});

// Attendance Tracker
router.get('/attendance', (req, res) => {
  const events = db.prepare(`
    SELECT e.*, 
           COUNT(a.id) as checked_in,
           e.max_attendees - COUNT(a.id) as spots_left
    FROM events e
    LEFT JOIN attendance a ON e.id = a.event_id
    WHERE e.start_time >= datetime('now')
    GROUP BY e.id
    ORDER BY e.start_time ASC
  `).all();
  
  res.render('admin/attendance', {
    title: 'Attendance Tracker - PRISM Labs',
    events
  });
});

router.get('/attendance/:eventId', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.eventId);
  const attendees = db.prepare(`
    SELECT a.*, u.name, u.email
    FROM attendance a
    JOIN users u ON a.user_id = u.id
    WHERE a.event_id = ?
    ORDER BY a.check_in_time ASC
  `).all(req.params.eventId);
  
  const allMembers = db.prepare('SELECT id, name, email FROM users WHERE is_active = 1 AND role = "member"').all();
  
  res.render('admin/event-attendance', {
    title: 'Attendance - ' + event.title,
    event,
    attendees,
    allMembers,
    qrCode: `qr_${req.params.eventId}`
  });
});

router.post('/attendance/:eventId/checkin', (req, res) => {
  const { user_id, status, notes } = req.body;
  
  try {
    db.prepare(`
      INSERT OR REPLACE INTO attendance (id, event_id, user_id, check_in_time, status, notes)
      VALUES (?, ?, ?, datetime('now'), ?, ?)
    `).run(`att_${req.params.eventId}_${user_id}`, req.params.eventId, user_id, status, notes);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Project Management
router.get('/projects', (req, res) => {
  const projects = db.prepare(`
    SELECT p.*, u.name as lead_name,
           (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count
    FROM projects p
    LEFT JOIN users u ON p.team_lead_id = u.id
    ORDER BY p.created_at DESC
  `).all();
  
  res.render('admin/projects', {
    title: 'Projects - PRISM Labs',
    projects
  });
});

router.get('/projects/new', (req, res) => {
  const members = db.prepare('SELECT id, name, role FROM users WHERE is_active = 1').all();
  res.render('admin/project-form', {
    title: 'New Project - PRISM Labs',
    project: null,
    members
  });
});

router.post('/projects', (req, res) => {
  const { name, description, track, team_lead_id, start_date, end_date, budget } = req.body;
  
  try {
    const projectId = uuidv4();
    db.prepare(`
      INSERT INTO projects (id, name, description, track, team_lead_id, start_date, end_date, budget)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(projectId, name, description, track, team_lead_id, start_date, end_date, parseFloat(budget) || 0);
    
    req.flash('success', 'Project created successfully!');
    res.redirect('/admin/projects/' + projectId);
  } catch (err) {
    req.flash('error', 'Failed to create project');
    res.redirect('/admin/projects/new');
  }
});

router.get('/projects/:id', (req, res) => {
  const project = db.prepare(`
    SELECT p.*, u.name as lead_name
    FROM projects p
    LEFT JOIN users u ON p.team_lead_id = u.id
    WHERE p.id = ?
  `).get(req.params.id);
  
  const members = db.prepare(`
    SELECT pm.*, u.name, u.email
    FROM project_members pm
    JOIN users u ON pm.user_id = u.id
    WHERE pm.project_id = ?
  `).all(req.params.id);
  
  const milestones = db.prepare('SELECT * FROM milestones WHERE project_id = ? ORDER BY sort_order').all(req.params.id);
  
  res.render('admin/project-detail', {
    title: project.name + ' - PRISM Labs',
    project,
    members,
    milestones
  });
});

// Inventory Management
router.get('/inventory', (req, res) => {
  const items = db.prepare('SELECT * FROM inventory_items ORDER BY category, name').all();
  res.render('admin/inventory', {
    title: 'Inventory - PRISM Labs',
    items
  });
});

router.get('/inventory/new', (req, res) => {
  res.render('admin/inventory-form', {
    title: 'Add Item - PRISM Labs',
    item: null
  });
});

router.post('/inventory', (req, res) => {
  const { name, description, category, quantity, location, condition, value } = req.body;
  
  try {
    const itemId = uuidv4();
    db.prepare(`
      INSERT INTO inventory_items (id, name, description, category, quantity, location, condition, value)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(itemId, name, description, category, parseInt(quantity), location, condition, parseFloat(value) || 0);
    
    // Log transaction
    db.prepare(`
      INSERT INTO inventory_transactions (id, item_id, transaction_type, quantity)
      VALUES (?, ?, 'add', ?)
    `).run(uuidv4(), itemId, parseInt(quantity));
    
    req.flash('success', 'Item added to inventory!');
    res.redirect('/admin/inventory');
  } catch (err) {
    req.flash('error', 'Failed to add item');
    res.redirect('/admin/inventory/new');
  }
});

router.post('/inventory/:id/transaction', (req, res) => {
  const { transaction_type, quantity, user_id, notes } = req.body;
  
  try {
    db.prepare(`
      INSERT INTO inventory_transactions (id, item_id, user_id, transaction_type, quantity, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), req.params.id, user_id || null, transaction_type, parseInt(quantity), notes);
    
    // Update quantity
    const item = db.prepare('SELECT quantity FROM inventory_items WHERE id = ?').get(req.params.id);
    let newQty = item.quantity;
    if (transaction_type === 'add') newQty += parseInt(quantity);
    else if (transaction_type === 'remove' || transaction_type === 'checkout') newQty -= parseInt(quantity);
    else if (transaction_type === 'return') newQty += parseInt(quantity);
    
    db.prepare('UPDATE inventory_items SET quantity = ?, updated_at = datetime("now") WHERE id = ?').run(newQty, req.params.id);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Analytics & Reporting
router.get('/analytics', (req, res) => {
  const attendanceByEvent = db.prepare(`
    SELECT e.title, e.start_time,
           COUNT(a.id) as attendees,
           e.max_attendees
    FROM events e
    LEFT JOIN attendance a ON e.id = a.event_id AND a.status = 'present'
    GROUP BY e.id
    ORDER BY e.start_time DESC
    LIMIT 20
  `).all();
  
  const membershipGrowth = db.prepare(`
    SELECT DATE(join_date) as date, COUNT(*) as count
    FROM users
    WHERE role = 'member'
    GROUP BY DATE(join_date)
    ORDER BY date ASC
  `).all();
  
  const popularResources = db.prepare(`
    SELECT title, views, downloads
    FROM resources
    ORDER BY views DESC
    LIMIT 10
  `).all();
  
  const budgetByCategory = db.prepare(`
    SELECT bc.name, bc.allocated, COALESCE(SUM(e.amount), 0) as spent
    FROM budget_categories bc
    LEFT JOIN expenses e ON bc.id = e.category_id AND e.status = 'approved'
    WHERE bc.year = strftime('%Y', 'now')
    GROUP BY bc.id
  `).all();
  
  res.render('admin/analytics', {
    title: 'Analytics - PRISM Labs',
    data: {
      attendanceByEvent,
      membershipGrowth,
      popularResources,
      budgetByCategory
    }
  });
});

// Permission Forms
router.get('/permissions', (req, res) => {
  const forms = db.prepare(`
    SELECT pf.*, u.name as student_name
    FROM permission_forms pf
    JOIN users u ON pf.user_id = u.id
    ORDER BY pf.signed_at DESC
  `).all();
  
  const validCount = db.prepare('SELECT COUNT(*) as count FROM permission_forms WHERE is_valid = 1').get().count;
  const expiringCount = db.prepare('SELECT COUNT(*) as count FROM permission_forms WHERE is_valid = 1 AND expires_at < date("now", "+30 days")').get().count;
  
  res.render('admin/permissions', {
    title: 'Permission Forms - PRISM Labs',
    forms,
    stats: { validCount, expiringCount }
  });
});

// Communication Tools
router.get('/communications', (req, res) => {
  const communications = db.prepare(`
    SELECT c.*, u.name as sender_name
    FROM communications c
    JOIN users u ON c.sent_by = u.id
    ORDER BY c.sent_at DESC
    LIMIT 50
  `).all();
  
  res.render('admin/communications', {
    title: 'Communications - PRISM Labs',
    communications
  });
});

router.get('/communications/new', (req, res) => {
  const members = db.prepare('SELECT id, name, email FROM users WHERE is_active = 1').all();
  res.render('admin/communication-form', {
    title: 'New Communication - PRISM Labs',
    members
  });
});

router.post('/communications/send', async (req, res) => {
  const { type, subject, content, recipients } = req.body;
  
  try {
    const commId = uuidv4();
    db.prepare(`
      INSERT INTO communications (id, type, subject, content, recipients, sent_by, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(commId, type, subject, content, JSON.stringify(recipients), req.user.id);
    
    // Send via appropriate channel (would integrate with Resend, Teams, etc.)
    req.flash('success', `${type} sent successfully!`);
    res.redirect('/admin/communications');
  } catch (err) {
    req.flash('error', 'Failed to send communication');
    res.redirect('/admin/communications/new');
  }
});

// Mentor Matching
router.get('/mentorship', (req, res) => {
  const mentorships = db.prepare(`
    SELECT m.*, 
           mentor.name as mentor_name, mentee.name as mentee_name,
           mentor.year_level as mentor_year, mentee.year_level as mentee_year
    FROM mentorships m
    JOIN users mentor ON m.mentor_id = mentor.id
    JOIN users mentee ON m.mentee_id = mentee.id
    ORDER BY m.created_at DESC
  `).all();
  
  const availableMentors = db.prepare(`
    SELECT id, name, year_level, bio, skills
    FROM users
    WHERE year_level >= 12 AND is_active = 1
    AND id NOT IN (SELECT mentor_id FROM mentorships WHERE status = 'active')
  `).all();
  
  const availableMentees = db.prepare(`
    SELECT id, name, year_level, bio, interests
    FROM users
    WHERE year_level <= 11 AND is_active = 1
    AND id NOT IN (SELECT mentee_id FROM mentorships WHERE status = 'active')
  `).all();
  
  res.render('admin/mentorship', {
    title: 'Mentor Matching - PRISM Labs',
    mentorships,
    availableMentors,
    availableMentees
  });
});

router.post('/mentorship', (req, res) => {
  const { mentor_id, mentee_id, goals, meeting_frequency } = req.body;
  
  try {
    const mentorshipId = uuidv4();
    db.prepare(`
      INSERT INTO mentorships (id, mentor_id, mentee_id, goals, meeting_frequency, start_date)
      VALUES (?, ?, ?, ?, ?, date('now'))
    `).run(mentorshipId, mentor_id, mentee_id, JSON.stringify(goals), meeting_frequency);
    
    req.flash('success', 'Mentorship created!');
    res.redirect('/admin/mentorship');
  } catch (err) {
    req.flash('error', 'Failed to create mentorship');
    res.redirect('/admin/mentorship');
  }
});

// Budget Tracker
router.get('/budget', (req, res) => {
  const categories = db.prepare(`
    SELECT bc.*, 
           COALESCE(SUM(e.amount), 0) as spent,
           bc.allocated - COALESCE(SUM(e.amount), 0) as remaining
    FROM budget_categories bc
    LEFT JOIN expenses e ON bc.id = e.category_id AND e.status = 'approved'
    WHERE bc.year = strftime('%Y', 'now')
    GROUP BY bc.id
  `).all();
  
  const expenses = db.prepare(`
    SELECT e.*, bc.name as category_name, u.name as submitted_by,
           approver.name as approved_by_name
    FROM expenses e
    JOIN budget_categories bc ON e.category_id = bc.id
    LEFT JOIN users u ON e.user_id = u.id
    LEFT JOIN users approver ON e.approved_by = approver.id
    ORDER BY e.expense_date DESC
    LIMIT 50
  `).all();
  
  res.render('admin/budget', {
    title: 'Budget Tracker - PRISM Labs',
    categories,
    expenses
  });
});

router.post('/budget/expense', (req, res) => {
  const { category_id, description, amount, expense_date, receipt_path } = req.body;
  
  try {
    const expenseId = uuidv4();
    db.prepare(`
      INSERT INTO expenses (id, category_id, user_id, description, amount, expense_date, receipt_path)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(expenseId, category_id, req.user.id, description, parseFloat(amount), expense_date, receipt_path);
    
    req.flash('success', 'Expense recorded!');
    res.redirect('/admin/budget');
  } catch (err) {
    req.flash('error', 'Failed to record expense');
    res.redirect('/admin/budget');
  }
});

router.post('/budget/expense/:id/approve', (req, res) => {
  try {
    db.prepare(`
      UPDATE expenses 
      SET status = 'approved', approved_by = ?, approved_at = datetime('now')
      WHERE id = ?
    `).run(req.user.id, req.params.id);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Events Management
router.get('/events', (req, res) => {
  const events = db.prepare('SELECT * FROM events ORDER BY start_time DESC').all();
  res.render('admin/events', {
    title: 'Events - PRISM Labs',
    events
  });
});

router.get('/events/new', (req, res) => {
  res.render('admin/event-form', {
    title: 'New Event - PRISM Labs',
    event: null
  });
});

router.post('/events', (req, res) => {
  const { title, description, event_type, track, start_time, end_time, location, max_attendees, is_recurring } = req.body;
  
  try {
    const eventId = uuidv4();
    db.prepare(`
      INSERT INTO events (id, title, description, event_type, track, start_time, end_time, location, max_attendees, is_recurring, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(eventId, title, description, event_type, track, start_time, end_time, location, parseInt(max_attendees) || null, is_recurring ? 1 : 0, req.user.id);
    
    req.flash('success', 'Event created!');
    res.redirect('/admin/events');
  } catch (err) {
    req.flash('error', 'Failed to create event');
    res.redirect('/admin/events/new');
  }
});

module.exports = router;
