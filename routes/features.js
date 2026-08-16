const express = require('express');
const router = express.Router();
const { createDatabase } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Helper: Get database instance for each request
async function getDB() {
  return await createDatabase();
}

// ==================== PUBLIC PROJECT SHOWCASE ====================

// Public showcase - anyone can view
router.get('/showcase', async (req, res) => {
  try {
    const db = await getDB();
    const { track, status, year } = req.query;
    
    let query = 'SELECT * FROM project_showcase WHERE is_public = 1';
    const params = [];
    
    if (track) { query += ' AND track = ?'; params.push(track); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (year) { query += ' AND year = ?'; params.push(parseInt(year)); }
    
    query += ' ORDER BY is_featured DESC, created_at DESC';
    
    const projects = db.prepare(query).all(...params);
    db.close();
    
    res.render('public/showcase', {
      title: 'Project Showcase - PRISM Labs',
      projects,
      filters: { track, status, year }
    });
  } catch (err) {
    console.error('Showcase error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Single project view
router.get('/showcase/:id', async (req, res) => {
  try {
    const db = await getDB();
    const project = db.prepare('SELECT * FROM project_showcase WHERE id = ?').get(req.params.id);
    db.close();
    
    if (!project) {
      req.flash('error', 'Project not found');
      return res.redirect('/showcase');
    }
    
    db.prepare('UPDATE project_showcase SET views_count = views_count + 1 WHERE id = ?').run(req.params.id);
    db.close();
    
    res.render('public/project-detail', {
      title: project.title + ' - PRISM Labs',
      project
    });
  } catch (err) {
    console.error('Project detail error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Member: Create showcase project
router.post('/showcase', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const { title, description, track, team_members, github_repo, demo_url, technologies, skills_developed, term, year } = req.body;
    
    const projectId = uuidv4();
    db.prepare(`
      INSERT INTO project_showcase (id, title, description, track, lead_student_id, team_members, github_repo, demo_url, technologies, skills_developed, term, year, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_progress')
    `).run(
      projectId, title, description, track, req.user.id, 
      JSON.stringify(team_members || [req.user.id]),
      github_repo, demo_url,
      JSON.stringify(technologies || []),
      JSON.stringify(skills_developed || []),
      term, parseInt(year) || new Date().getFullYear()
    );
    db.close();
    
    req.flash('success', 'Project added to showcase!');
    res.redirect('/members/showcase/' + projectId);
  } catch (err) {
    req.flash('error', 'Failed to create project');
    res.redirect('back');
  }
});

// Like showcase project
router.post('/showcase/:id/like', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const likeId = uuidv4();
    db.prepare(`
      INSERT OR IGNORE INTO showcase_likes (id, user_id, project_id)
      VALUES (?, ?, ?)
    `).run(likeId, req.user.id, req.params.id);
    
    db.prepare('UPDATE project_showcase SET likes_count = likes_count + 1 WHERE id = ?').run(req.params.id);
    db.close();
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ==================== LEARNING PATHS ====================

// View all learning paths
router.get('/paths', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const paths = db.prepare('SELECT * FROM learning_paths WHERE is_active = 1 ORDER BY sort_order').all();
    
    const userProgress = db.prepare(`
      SELECT path_id, COUNT(*) as milestones_completed, MAX(progress_percentage) as progress
      FROM user_path_progress
      WHERE user_id = ? AND status = 'completed'
      GROUP BY path_id
    `).all(req.user.id);
    db.close();
    
    res.render('members/learning-paths', {
      title: 'Learning Paths - PRISM Labs',
      paths,
      userProgress
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// View single path with milestones
router.get('/paths/:id', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const path = db.prepare('SELECT * FROM learning_paths WHERE id = ?').get(req.params.id);
    
    if (!path) {
      req.flash('error', 'Path not found');
      db.close();
      return res.redirect('/members/paths');
    }
    
    const milestones = db.prepare(`
      SELECT pm.*, b.name as badge_name, b.icon as badge_icon
      FROM path_milestones pm
      LEFT JOIN badges b ON pm.badge_id = b.id
      WHERE pm.path_id = ?
      ORDER BY pm.order_in_path
    `).all(req.params.id);
    
    const userProgress = db.prepare(`
      SELECT * FROM user_path_progress
      WHERE user_id = ? AND path_id = ?
    `).all(req.user.id, req.params.id);
    db.close();
    
    res.render('members/path-detail', {
      title: path.name + ' - PRISM Labs',
      path,
      milestones,
      userProgress
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start a learning path
router.post('/paths/:id/start', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const progressId = uuidv4();
    db.prepare(`
      INSERT INTO user_path_progress (id, user_id, path_id, status)
      VALUES (?, ?, ?, 'in_progress')
    `).run(progressId, req.user.id, req.params.id);
    db.close();
    
    req.flash('success', 'Learning path started!');
    res.redirect('/members/paths/' + req.params.id);
  } catch (err) {
    req.flash('error', 'Failed to start path');
    res.redirect('back');
  }
});

// Complete a milestone
router.post('/paths/milestone/:id/complete', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const { path_id } = req.body;
    const progressId = uuidv4();
    
    db.prepare(`
      INSERT OR REPLACE INTO user_path_progress (id, user_id, path_id, milestone_id, completed_at, status, progress_percentage)
      VALUES (?, ?, ?, ?, datetime('now'), 'completed', 100)
    `).run(progressId, req.user.id, path_id, req.params.id);
    
    const milestone = db.prepare('SELECT badge_id FROM path_milestones WHERE id = ?').get(req.params.id);
    if (milestone && milestone.badge_id) {
      const badgeId = uuidv4();
      db.prepare(`
        INSERT OR IGNORE INTO user_badges (id, user_id, badge_id, earned_date, context)
        VALUES (?, ?, ?, datetime('now'), ?)
      `).run(badgeId, req.user.id, milestone.badge_id, 'Completed milestone in learning path');
    }
    db.close();
    
    req.flash('success', 'Milestone completed!');
    res.redirect('/members/paths/' + path_id);
  } catch (err) {
    req.flash('error', 'Failed to complete milestone');
    res.redirect('back');
  }
});

// View career outcomes
router.get('/careers', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const careers = db.prepare('SELECT * FROM career_outcomes WHERE is_active = 1').all();
    db.close();
    
    res.render('members/careers', {
      title: 'Career Pathways - PRISM Labs',
      careers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== EQUIPMENT & ROOM BOOKING ====================

// View bookable items
router.get('/bookings', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const items = db.prepare('SELECT * FROM bookable_items WHERE is_active = 1 ORDER BY item_type, name').all();
    db.close();
    
    res.render('members/bookings', {
      title: 'Book Equipment & Rooms - PRISM Labs',
      items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create booking
router.post('/bookings', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const { item_id, start_time, end_time, purpose } = req.body;
    
    const bookingId = uuidv4();
    const item = db.prepare('SELECT * FROM bookable_items WHERE id = ?').get(item_id);
    
    const status = item.requires_approval ? 'pending' : 'approved';
    
    db.prepare(`
      INSERT INTO bookings (id, user_id, item_id, start_time, end_time, purpose, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(bookingId, req.user.id, item_id, start_time, end_time, purpose, status);
    
    if (status === 'approved') {
      db.prepare('UPDATE bookable_items SET available_quantity = available_quantity - 1 WHERE id = ?').run(item_id);
    }
    db.close();
    
    req.flash('success', status === 'pending' ? 'Booking submitted for approval' : 'Booking confirmed!');
    res.redirect('/members/bookings');
  } catch (err) {
    req.flash('error', 'Failed to create booking');
    res.redirect('back');
  }
});

// My bookings
router.get('/my-bookings', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const bookings = db.prepare(`
      SELECT b.*, bi.name as item_name, bi.item_type,
             u.name as approved_by_name
      FROM bookings b
      JOIN bookable_items bi ON b.item_id = bi.id
      LEFT JOIN users u ON b.approved_by = u.id
      WHERE b.user_id = ?
      ORDER BY b.start_time DESC
    `).all(req.user.id);
    db.close();
    
    res.render('members/my-bookings', {
      title: 'My Bookings - PRISM Labs',
      bookings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resource request
router.get('/requests', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const requests = db.prepare(`
      SELECT r.*, u.name as requester_name, p.name as project_name
      FROM resource_requests r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN projects p ON r.project_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `).all(req.user.id);
    db.close();
    
    res.render('members/requests', {
      title: 'Resource Requests - PRISM Labs',
      requests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create resource request
router.post('/requests', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const { request_type, item_name, description, justification, estimated_cost, quantity, project_id } = req.body;
    
    const requestId = uuidv4();
    db.prepare(`
      INSERT INTO resource_requests (id, user_id, request_type, item_name, description, justification, estimated_cost, quantity, project_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(requestId, req.user.id, request_type, item_name, description, justification, parseFloat(estimated_cost) || 0, parseInt(quantity) || 1, project_id || null);
    db.close();
    
    req.flash('success', 'Resource request submitted!');
    res.redirect('/members/requests');
  } catch (err) {
    req.flash('error', 'Failed to submit request');
    res.redirect('back');
  }
});

// ==================== BLOG / NEWS SECTION ====================

// Public blog listing
router.get('/blog', async (req, res) => {
  try {
    const db = await getDB();
    const { type, tag } = req.query;
    
    let query = 'SELECT * FROM blog_posts WHERE is_published = 1';
    const params = [];
    
    if (type) { query += ' AND post_type = ?'; params.push(type); }
    query += ' ORDER BY published_at DESC';
    
    const posts = db.prepare(query).all(...params);
    db.close();
    
    res.render('public/blog', {
      title: 'PRISM Labs Blog',
      posts,
      filters: { type, tag }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single blog post
router.get('/blog/:slug', async (req, res) => {
  try {
    const db = await getDB();
    const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1').get(req.params.slug);
    
    if (!post) {
      req.flash('error', 'Post not found');
      db.close();
      return res.redirect('/blog');
    }
    
    db.prepare('UPDATE blog_posts SET views_count = views_count + 1 WHERE id = ?').run(post.id);
    
    const comments = db.prepare(`
      SELECT c.*, u.name as author_name
      FROM blog_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? AND c.is_approved = 1
      ORDER BY c.created_at ASC
    `).all(post.id);
    db.close();
    
    res.render('public/blog-post', {
      title: post.title + ' - PRISM Labs',
      post,
      comments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create blog post
router.post('/admin/blog', requireAdmin, async (req, res) => {
  try {
    const db = await getDB();
    const { title, content, excerpt, post_type, track, tags, featured_image, is_published } = req.body;
    
    const postId = uuidv4();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    db.prepare(`
      INSERT INTO blog_posts (id, title, slug, content, excerpt, author_id, post_type, track, tags, featured_image, is_published, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      postId, title, slug, content, excerpt, req.user.id, post_type, track,
      JSON.stringify(tags || []), featured_image, is_published ? 1 : 0
    );
    db.close();
    
    req.flash('success', 'Blog post created!');
    res.redirect('/blog/' + slug);
  } catch (err) {
    req.flash('error', 'Failed to create post');
    res.redirect('back');
  }
});

// Add comment to blog post
router.post('/blog/:id/comment', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const { content, parent_id } = req.body;
    
    const commentId = uuidv4();
    db.prepare(`
      INSERT INTO blog_comments (id, post_id, user_id, content, parent_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(commentId, req.params.id, req.user.id, content, parent_id || null);
    db.close();
    
    req.flash('success', 'Comment added!');
    res.redirect('/blog/' + req.params.id);
  } catch (err) {
    req.flash('error', 'Failed to add comment');
    res.redirect('back');
  }
});

// ==================== THEME PREFERENCES ====================

// Get user preferences
router.get('/settings/theme', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const prefs = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);
    db.close();
    
    res.render('members/theme-settings', {
      title: 'Theme Settings - PRISM Labs',
      prefs: prefs || { theme: 'light', accent_color: '#2563EB' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update theme preference
router.post('/settings/theme', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const { theme, accent_color, font_size } = req.body;
    
    db.prepare(`
      INSERT OR REPLACE INTO user_preferences (user_id, theme, accent_color, font_size, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(req.user.id, theme, accent_color, font_size || 'medium');
    db.close();
    
    req.flash('success', 'Theme updated!');
    res.redirect('/members/settings/theme');
  } catch (err) {
    req.flash('error', 'Failed to update theme');
    res.redirect('back');
  }
});



// ==================== COMPREHENSIVE RESOURCE LIBRARY ====================

// Main resources page with all categories
router.get('/resources', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const { category, track, level } = req.query;
    
    let query = 'SELECT * FROM learning_resources WHERE is_active = 1';
    const params = [];
    
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (track) { query += ' AND track = ?'; params.push(track); }
    if (level) { query += ' AND difficulty = ?'; params.push(level); }
    
    query += ' ORDER BY category, sort_order';
    
    const resources = db.prepare(query).all(...params);
    
    // Get categories for filter
    const categories = db.prepare('SELECT DISTINCT category FROM learning_resources WHERE is_active = 1').all();
    const tracks = db.prepare('SELECT DISTINCT track FROM learning_resources WHERE is_active = 1').all();
    
    db.close();
    
    res.render('members/resources', {
      title: 'Learning Resources - PRISM Labs',
      resources,
      categories,
      tracks,
      filters: { category, track, level }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resource detail page
router.get('/resources/:id', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const resource = db.prepare('SELECT * FROM learning_resources WHERE id = ?').get(req.params.id);
    
    if (!resource) {
      req.flash('error', 'Resource not found');
      db.close();
      return res.redirect('/members/resources');
    }
    
    // Get related resources
    const related = db.prepare(`
      SELECT * FROM learning_resources
      WHERE track = ? AND id != ? AND is_active = 1
      ORDER BY RANDOM()
      LIMIT 5
    `).all(resource.track, req.params.id);
    
    // Increment views
    db.prepare('UPDATE learning_resources SET views_count = views_count + 1 WHERE id = ?').run(req.params.id);
    db.close();
    
    res.render('members/resource-detail', {
      title: resource.title + ' - PRISM Labs',
      resource,
      related
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bookmark resource
router.post('/resources/:id/bookmark', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const bookmarkId = uuidv4();
    db.prepare(`
      INSERT OR IGNORE INTO resource_bookmarks (id, user_id, resource_id)
      VALUES (?, ?, ?)
    `).run(bookmarkId, req.user.id, req.params.id);
    db.close();
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// My bookmarked resources
router.get('/resources/bookmarks', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const bookmarks = db.prepare(`
      SELECT r.*, rb.created_at as bookmarked_at
      FROM resource_bookmarks rb
      JOIN learning_resources r ON rb.resource_id = r.id
      WHERE rb.user_id = ?
      ORDER BY rb.created_at DESC
    `).all(req.user.id);
    db.close();
    
    res.render('members/resource-bookmarks', {
      title: 'My Bookmarks - PRISM Labs',
      bookmarks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suggest a resource
router.post('/resources/suggest', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const { title, url, description, category, track } = req.body;
    
    const suggestionId = uuidv4();
    db.prepare(`
      INSERT INTO resource_suggestions (id, user_id, title, url, description, category, track, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(suggestionId, req.user.id, title, url, description, category, track);
    db.close();
    
    req.flash('success', 'Resource suggestion submitted!');
    res.redirect('/members/resources');
  } catch (err) {
    req.flash('error', 'Failed to submit suggestion');
    res.redirect('back');
  }
});


module.exports = router;
