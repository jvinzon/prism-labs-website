const db = require('../db');
const { v4: uuidv4 } = require('uuid');

function trackAnalytics(req, res, next) {
  // Track page views and events
  const track = (eventType, metadata = {}) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO analytics_events (id, event_type, user_id, metadata, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
      stmt.run(
        uuidv4(),
        eventType,
        req.user?.id || null,
        JSON.stringify({
          path: req.path,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          ...metadata
        })
      );
    } catch (err) {
      console.error('Analytics error:', err.message);
    }
  };

  req.track = track;
  next();
}

module.exports = { trackAnalytics };
