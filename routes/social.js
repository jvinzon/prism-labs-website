const express = require('express');
const router = express.Router();
const { createDatabase } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');

async function getDB() {
  return await createDatabase();
}

// Social feed
router.get('/feed', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const posts = db.prepare(`
      SELECT p.*, u.name as author_name, u.avatar_url,
             (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
             (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) as comment_count,
             (SELECT COUNT(*) FROM post_retweets WHERE original_post_id = p.id) as retweet_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_deleted = 0
      ORDER BY p.created_at DESC
      LIMIT 50
    `).all();
    db.close();
    
    res.render('members/social-feed', {
      title: 'Social Feed - PRISM Labs',
      posts,
      filter: 'all'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create post
router.post('/posts', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const { content, original_post_id } = req.body;
    
    const postId = uuidv4();
    db.prepare(`
      INSERT INTO posts (id, user_id, content, original_post_id)
      VALUES (?, ?, ?, ?)
    `).run(postId, req.user.id, content, original_post_id || null);
    db.close();
    
    res.json({ success: true, post_id: postId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Like post
router.post('/posts/:id/like', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const likeId = uuidv4();
    db.prepare(`
      INSERT OR IGNORE INTO post_likes (id, user_id, post_id)
      VALUES (?, ?, ?)
    `).run(likeId, req.user.id, req.params.id);
    db.close();
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Notifications
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const notifications = db.prepare(`
      SELECT n.*, u.name as actor_name
      FROM notifications n
      JOIN users u ON n.actor_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `).all(req.user.id);
    db.close();
    
    res.render('members/notifications', {
      title: 'Notifications - PRISM Labs',
      notifications
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bookmarks
router.get('/bookmarks', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const bookmarks = db.prepare(`
      SELECT p.*, u.name as author_name
      FROM post_bookmarks b
      JOIN posts p ON b.post_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(req.user.id);
    db.close();
    
    res.render('members/bookmarks', {
      title: 'Bookmarks - PRISM Labs',
      posts: bookmarks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trending
router.get('/trending', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const trending = db.prepare(`
      SELECT hashtag, COUNT(*) as post_count
      FROM post_hashtags
      WHERE created_at > datetime('now', '-7 days')
      GROUP BY hashtag
      ORDER BY post_count DESC
      LIMIT 10
    `).all();
    db.close();
    
    res.render('members/trending', {
      title: 'Trending - PRISM Labs',
      trending
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search
router.get('/search', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const { q, type = 'posts' } = req.query;
    
    let results = [];
    if (type === 'posts') {
      results = db.prepare(`
        SELECT p.*, u.name as author_name
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.content LIKE ? AND p.is_deleted = 0
        ORDER BY p.created_at DESC
        LIMIT 20
      `).all('%' + q + '%');
    } else if (type === 'users') {
      results = db.prepare(`
        SELECT id, name, avatar_url
        FROM users
        WHERE name LIKE ?
        LIMIT 20
      `).all('%' + q + '%');
    }
    db.close();
    
    res.render('members/search', {
      title: 'Search - PRISM Labs',
      results,
      query: q,
      type
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
