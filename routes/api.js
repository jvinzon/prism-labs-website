const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Resources API
router.get('/resources', (req, res) => {
  const resources = db.prepare('SELECT id, title, description, resource_type, track, difficulty, views FROM resources WHERE is_published = 1 ORDER BY created_at DESC').all();
  res.json(resources);
});

// Events API
router.get('/events', (req, res) => {
  const events = db.prepare('SELECT * FROM events WHERE start_time >= datetime("now") ORDER BY start_time ASC').all();
  res.json(events);
});

// Members API (public directory)
router.get('/members', (req, res) => {
  const members = db.prepare(`
    SELECT id, name, year_level, bio, interests, skills
    FROM users
    WHERE is_active = 1 AND role = 'member'
    ORDER BY name
  `).all();
  res.json(members);
});

// Badges API
router.get('/badges', (req, res) => {
  const badges = db.prepare('SELECT * FROM badges ORDER BY category, points').all();
  res.json(badges);
});

// Forum API
router.get('/posts', (req, res) => {
  const posts = db.prepare(`
    SELECT p.id, p.title, p.created_at, p.views, c.name as category_name, u.name as author_name
    FROM posts p
    JOIN categories c ON p.category_id = c.id
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 50
  `).all();
  res.json(posts);
});

// Projects API
router.get('/projects', (req, res) => {
  const projects = db.prepare(`
    SELECT p.id, p.name, p.description, p.track, p.status, u.name as lead_name
    FROM projects p
    LEFT JOIN users u ON p.team_lead_id = u.id
    WHERE p.status != 'archived'
    ORDER BY p.created_at DESC
  `).all();
  res.json(projects);
});

// GitHub integration webhook
router.post('/webhooks/github', (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;
  
  console.log('GitHub webhook:', event, payload);
  
  // Process webhook (update project activity, etc.)
  res.json({ received: true });
});

// Google Calendar webhook
router.post('/webhooks/google', (req, res) => {
  console.log('Google Calendar webhook:', req.body);
  res.json({ received: true });
});

module.exports = router;
