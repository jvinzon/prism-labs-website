const express = require('express');
const router = express.Router();
const db = require('../db');

// Dashboard
router.get('/dashboard', (req, res) => {
  const user = req.user;
  
  // Get user's badges
  const badges = db.prepare(`
    SELECT b.*, ub.earned_date, ub.context
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = ?
    ORDER BY ub.earned_date DESC
  `).all(user.id);
  
  // Get upcoming events
  const events = db.prepare(`
    SELECT * FROM events
    WHERE start_time >= datetime('now')
    ORDER BY start_time ASC
    LIMIT 5
  `).all();
  
  // Get user's projects
  const projects = db.prepare(`
    SELECT p.*, pm.role
    FROM projects p
    JOIN project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = ?
    ORDER BY p.updated_at DESC
    LIMIT 5
  `).all(user.id);
  
  // Get attendance stats
  const attendanceStats = db.prepare(`
    SELECT COUNT(*) as total, 
           SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
    FROM attendance
    WHERE user_id = ?
  `).get(user.id);
  
  res.render('members/dashboard', {
    title: 'Dashboard - PRISM Labs',
    user,
    badges,
    events,
    projects,
    attendanceStats: attendanceStats || { total: 0, present: 0 }
  });
});

// Resource Library
router.get('/resources', (req, res) => {
  const { track, difficulty, type } = req.query;
  
  let query = 'SELECT * FROM resources WHERE is_published = 1';
  const params = [];
  
  if (track) {
    query += ' AND track = ?';
    params.push(track);
  }
  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }
  if (type) {
    query += ' AND resource_type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const resources = db.prepare(query).all(...params);
  
  res.render('members/resources', {
    title: 'Resource Library - PRISM Labs',
    resources,
    filters: { track, difficulty, type }
  });
});

router.get('/resources/:id', (req, res) => {
  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
  
  if (!resource) {
    req.flash('error', 'Resource not found');
    return res.redirect('/members/resources');
  }
  
  // Increment views
  db.prepare('UPDATE resources SET views = views + 1 WHERE id = ?').run(req.params.id);
  
  res.render('members/resource-view', {
    title: resource.title + ' - PRISM Labs',
    resource
  });
});

// Event Calendar
router.get('/calendar', (req, res) => {
  const events = db.prepare(`
    SELECT * FROM events
    WHERE start_time >= datetime('now')
    ORDER BY start_time ASC
  `).all();
  
  res.render('members/calendar', {
    title: 'Calendar - PRISM Labs',
    events
  });
});

router.get('/events/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  
  if (!event) {
    req.flash('error', 'Event not found');
    return res.redirect('/members/calendar');
  }
  
  // Check attendance
  const attendance = db.prepare('SELECT * FROM attendance WHERE event_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  
  res.render('members/event-detail', {
    title: event.title + ' - PRISM Labs',
    event,
    attendance
  });
});

router.post('/events/:id/checkin', (req, res) => {
  const { qr_code } = req.body;
  
  try {
    db.prepare(`
      INSERT OR REPLACE INTO attendance (id, event_id, user_id, qr_code, check_in_time, status)
      VALUES (?, ?, ?, ?, datetime('now'), 'present')
    `).run(`att_${req.params.id}_${req.user.id}`, req.params.id, req.user.id, qr_code);
    
    req.flash('success', 'Checked in successfully!');
  } catch (err) {
    req.flash('error', 'Check-in failed');
  }
  
  res.redirect('/members/events/' + req.params.id);
});

// Member Directory
router.get('/directory', (req, res) => {
  const { track, year } = req.query;
  
  let query = 'SELECT id, name, year_level, bio, avatar_url, interests, skills, privacy_settings FROM users WHERE is_active = 1';
  const params = [];
  
  if (track) {
    // Would need to join with project_members or user_tracks table
  }
  if (year) {
    query += ' AND year_level = ?';
    params.push(parseInt(year));
  }
  
  const members = db.prepare(query).all(...params);
  
  res.render('members/directory', {
    title: 'Member Directory - PRISM Labs',
    members,
    filters: { track, year }
  });
});

router.get('/members/:id', (req, res) => {
  const member = db.prepare(`
    SELECT id, name, year_level, bio, avatar_url, interests, skills, join_date, privacy_settings
    FROM users WHERE id = ? AND is_active = 1
  `).get(req.params.id);
  
  if (!member) {
    req.flash('error', 'Member not found');
    return res.redirect('/members/directory');
  }
  
  // Get badges
  const badges = db.prepare(`
    SELECT b.*, ub.earned_date
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = ?
  `).all(req.params.id);
  
  // Get projects
  const projects = db.prepare(`
    SELECT p.* FROM projects p
    JOIN project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = ? AND p.status != 'archived'
  `).all(req.params.id);
  
  res.render('members/member-profile', {
    title: member.name + ' - PRISM Labs',
    member,
    badges,
    projects
  });
});

// Discussion Forum
router.get('/forum', (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(p.id) as post_count
    FROM categories c
    LEFT JOIN posts p ON c.id = p.category_id
    WHERE c.is_locked = 0
    GROUP BY c.id
    ORDER BY c.sort_order
  `).all();
  
  res.render('members/forum', {
    title: 'Forum - PRISM Labs',
    categories
  });
});

router.get('/forum/:category', (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.category);
  
  if (!category) {
    req.flash('error', 'Category not found');
    return res.redirect('/members/forum');
  }
  
  const posts = db.prepare(`
    SELECT p.*, u.name as author_name,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
           (SELECT COALESCE(SUM(vote_type), 0) FROM votes WHERE post_id = p.id) as votes
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.category_id = ?
    ORDER BY p.is_pinned DESC, p.created_at DESC
  `).all(category.id);
  
  res.render('members/category', {
    title: category.name + ' - PRISM Labs',
    category,
    posts
  });
});

router.get('/forum/:category/new', (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.category);
  
  res.render('members/new-post', {
    title: 'New Post - PRISM Labs',
    category
  });
});

router.post('/forum/:category/new', (req, res) => {
  const { title, content, tags } = req.body;
  const { v4: uuidv4 } = require('uuid');
  
  try {
    const postId = uuidv4();
    db.prepare(`
      INSERT INTO posts (id, category_id, user_id, title, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(postId, req.params.category, req.user.id, title, content);
    
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim()).filter(t => t);
      const insertTag = db.prepare('INSERT INTO post_tags (id, post_id, tag) VALUES (?, ?, ?)');
      tagList.forEach(tag => {
        insertTag.run(uuidv4(), postId, tag);
      });
    }
    
    // Award badge for first post
    const postCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(req.user.id);
    if (postCount.count === 1) {
      // First post badge logic here
    }
    
    req.flash('success', 'Post created successfully!');
    res.redirect('/members/forum/' + req.params.category);
  } catch (err) {
    console.error('Post error:', err);
    req.flash('error', 'Failed to create post');
    res.redirect('/members/forum/' + req.params.category + '/new');
  }
});

router.get('/forum/post/:id', (req, res) => {
  const post = db.prepare(`
    SELECT p.*, u.name as author_name, u.avatar_url
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(req.params.id);
  
  if (!post) {
    req.flash('error', 'Post not found');
    return res.redirect('/members/forum');
  }
  
  // Increment views
  db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').run(req.params.id);
  
  // Get comments
  const comments = db.prepare(`
    SELECT c.*, u.name as author_name, u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.is_accepted DESC, c.votes DESC, c.created_at ASC
  `).all(req.params.id);
  
  // Get tags
  const tags = db.prepare('SELECT tag FROM post_tags WHERE post_id = ?').all(req.params.id);
  
  res.render('members/post-detail', {
    title: post.title + ' - PRISM Labs',
    post,
    comments,
    tags
  });
});

// Achievements
router.get('/achievements', (req, res) => {
  const allBadges = db.prepare('SELECT * FROM badges ORDER BY category, points').all();
  const userBadges = db.prepare(`
    SELECT badge_id FROM user_badges WHERE user_id = ?
  `).all(req.user.id).map(b => b.badge_id);
  
  res.render('members/achievements', {
    title: 'Achievements - PRISM Labs',
    allBadges,
    userBadges
  });
});

// Code Playground
router.get('/playground', (req, res) => {
  res.render('members/playground', {
    title: 'Code Playground - PRISM Labs'
  });
});

module.exports = router;
