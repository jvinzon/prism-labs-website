const express = require('express');
const router = express.Router();
const { createDatabase } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { requireAuth, requireAdmin } = require('../middleware/auth');

async function getDB() {
  return await createDatabase();
}

// ==================== XP & LEVELS ====================

// Get user's XP and level
router.get('/xp/profile/:userId', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const xpData = db.prepare(`
      SELECT x.*, u.name, u.avatar_url,
             l.name_english as level_name, l.name_te_reo, l.badge_icon, l.badge_color,
             (SELECT min_xp FROM levels WHERE level_number = l.level_number + 1) as next_level_xp
      FROM xp_system x
      JOIN users u ON x.user_id = u.id
      JOIN levels l ON x.current_level = l.level_number
      WHERE x.user_id = ?
    `).get(req.params.userId);
    db.close();
    
    res.json(xpData || { message: 'XP profile initialized', xp: 0, level: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Award XP (internal function)
async function awardXP(userId, amount, activityType, relatedId = null) {
  const db = await getDB();
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  
  const cap = db.prepare('SELECT * FROM xp_caps WHERE activity_type = ?').get(activityType);
  if (cap) {
    const weeklyEarned = db.prepare(`
      SELECT COALESCE(SUM(xp_amount), 0) as total
      FROM xp_transactions
      WHERE user_id = ? AND transaction_type = 'earned' AND activity_type = ? AND created_at > ?
    `).get(userId, activityType, weekStart.toISOString());
    
    if (weeklyEarned.total + amount > cap.weekly_cap) {
      db.close();
      return { success: false, message: 'Weekly XP cap reached' };
    }
  }
  
  const txId = uuidv4();
  db.prepare(`
    INSERT INTO xp_transactions (id, user_id, xp_amount, transaction_type, activity_type, related_id)
    VALUES (?, ?, ?, 'earned', ?, ?)
  `).run(txId, userId, amount, activityType, relatedId);
  
  const xp = db.prepare('SELECT * FROM xp_system WHERE user_id = ?').get(userId);
  if (xp) {
    const newTotal = xp.total_xp + amount;
    const newWeekly = xp.weekly_xp + amount;
    const nextLevel = db.prepare('SELECT * FROM levels WHERE min_xp <= ? ORDER BY min_xp DESC LIMIT 1').get(newTotal);
    const newLevel = nextLevel ? nextLevel.level_number : 1;
    
    db.prepare(`
      UPDATE xp_system
      SET total_xp = ?, weekly_xp = ?, current_level = ?, last_active = datetime('now')
      WHERE user_id = ?
    `).run(newTotal, newWeekly, newLevel, userId);
    db.close();
    
    return {
      success: true,
      xp_awarded: amount,
      new_total: newTotal,
      new_level: newLevel,
      leveled_up: newLevel > xp.current_level
    };
  }
  db.close();
  return { success: false };
}

// Manual XP award (admin only)
router.post('/xp/award', requireAdmin, async (req, res) => {
  try {
    const { user_id, xp_amount, reason, activity_type } = req.body;
    const result = await awardXP(user_id, xp_amount, activity_type || 'manual', null);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Revoke XP (admin only)
router.post('/xp/revoke', requireAdmin, async (req, res) => {
  try {
    const db = await getDB();
    const { user_id, xp_amount, reason } = req.body;
    
    const txId = uuidv4();
    db.prepare(`
      INSERT INTO xp_transactions (id, user_id, xp_amount, transaction_type, reason, admin_user_id)
      VALUES (?, ?, ?, 'revoked', ?, ?)
    `).run(txId, user_id, -xp_amount, reason, req.user.id);
    
    const xp = db.prepare('SELECT total_xp FROM xp_system WHERE user_id = ?').get(user_id);
    if (xp) {
      const newTotal = Math.max(0, xp.total_xp - xp_amount);
      const newLevel = db.prepare('SELECT level_number FROM levels WHERE min_xp <= ? ORDER BY min_xp DESC LIMIT 1').get(newTotal);
      db.prepare(`UPDATE xp_system SET total_xp = ?, current_level = ? WHERE user_id = ?`).run(newTotal, newLevel ? newLevel.level_number : 1, user_id);
    }
    db.close();
    
    res.json({ success: true, xp_revoked: xp_amount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== LEADERBOARDS ====================

// Individual XP leaderboard
router.get('/leaderboard/individual', async (req, res) => {
  try {
    const db = await getDB();
    const { period = 'all', limit = 100 } = req.query;
    
    let query = `
      SELECT x.total_xp, x.current_level, u.name, u.year_level,
             l.name_english as level_name, l.badge_icon
      FROM xp_system x
      JOIN users u ON x.user_id = u.id
      JOIN levels l ON x.current_level = l.level_number
      WHERE u.is_active = 1
      ORDER BY total_xp DESC LIMIT ?
    `;
    
    const leaderboard = db.prepare(query).all(parseInt(limit));
    db.close();
    
    const ranked = leaderboard.map((entry, index) => ({ rank: index + 1, ...entry }));
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Team leaderboard
router.get('/leaderboard/teams', async (req, res) => {
  try {
    const db = await getDB();
    const teams = db.prepare(`
      SELECT t.*, (SELECT COUNT(*) FROM user_teams ut WHERE ut.team_id = t.id) as member_count
      FROM teams t WHERE t.is_active = 1
      ORDER BY t.term_points DESC
    `).all();
    db.close();
    
    const ranked = teams.map((team, index) => ({ rank: index + 1, ...team }));
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CHALLENGES ====================

router.get('/challenges', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const { type = 'weekly' } = req.query;
    
    const challenges = db.prepare(`
      SELECT c.*, b.name as badge_name, b.icon as badge_icon
      FROM challenges c
      LEFT JOIN badges b ON c.badge_id = b.id
      WHERE c.challenge_type = ? AND c.is_active = 1 AND c.end_date >= date('now')
      ORDER BY c.difficulty, c.xp_reward DESC
    `).all(type);
    db.close();
    
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/challenges/:id/join', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const challengeId = uuidv4();
    db.prepare(`
      INSERT OR IGNORE INTO user_challenges (id, user_id, challenge_id, status)
      VALUES (?, ?, ?, 'in_progress')
    `).run(challengeId, req.user.id, req.params.id);
    db.close();
    
    res.json({ success: true, message: 'Challenge joined!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== TEAMS ====================

router.get('/teams/my-team', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const currentTerm = getCurrentTerm();
    const team = db.prepare(`
      SELECT t.*, ut.is_captain, ut.can_change_team
      FROM user_teams ut
      JOIN teams t ON ut.team_id = t.id
      WHERE ut.user_id = ? AND ut.term_joined = ?
    `).get(req.user.id, currentTerm);
    db.close();
    
    res.json(team || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/teams/change', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const currentTerm = getCurrentTerm();
    
    db.prepare(`
      INSERT OR REPLACE INTO user_teams (user_id, team_id, term_joined, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(req.user.id, req.body.team_id, currentTerm);
    db.close();
    
    res.json({ success: true, message: 'Team changed!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function getCurrentTerm() {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  let term = 'T1';
  if (month >= 5 && month <= 8) term = 'T2';
  else if (month >= 9) term = 'T3';
  return `${year}-${term}`;
}

// ==================== PRISM SHOP ====================

router.get('/shop', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const items = db.prepare(`
      SELECT * FROM shop_items WHERE is_active = 1
      ORDER BY sort_order, xp_cost
    `).all();
    db.close();
    
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/shop/purchase', requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    const { item_id } = req.body;
    
    const item = db.prepare('SELECT * FROM shop_items WHERE id = ?').get(item_id);
    if (!item) {
      db.close();
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const xp = db.prepare('SELECT total_xp FROM xp_system WHERE user_id = ?').get(req.user.id);
    if (xp.total_xp < item.xp_cost) {
      db.close();
      return res.status(400).json({ error: 'Not enough XP' });
    }
    
    const purchaseId = uuidv4();
    db.prepare(`
      INSERT INTO user_purchases (id, user_id, item_id, xp_spent, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).run(purchaseId, req.user.id, item_id, item.xp_cost);
    
    db.prepare(`
      INSERT INTO xp_transactions (id, user_id, xp_amount, transaction_type, activity_type)
      VALUES (?, ?, ?, 'spent', 'shop_purchase')
    `).run(uuidv4(), req.user.id, -item.xp_cost);
    
    db.prepare('UPDATE xp_system SET total_xp = total_xp - ? WHERE user_id = ?')
      .run(item.xp_cost, req.user.id);
    db.close();
    
    res.json({ success: true, purchase_id: purchaseId, message: 'Purchase successful!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
