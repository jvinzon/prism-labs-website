const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');
require('dotenv').config();

// Microsoft Teams integration
router.post('/teams/send', async (req, res) => {
  try {
    const { subject, content } = req.body;
    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return res.status(400).json({ error: 'Teams webhook not configured' });
    }
    
    const message = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "2563EB",
      "summary": subject,
      "sections": [{
        "activityTitle": "PRISM Labs Announcement",
        "activitySubtitle": new Date().toLocaleDateString(),
        "text": content
      }]
    };
    
    await axios.post(webhookUrl, message);
    
    // Log communication
    db.prepare(`
      INSERT INTO communications (id, type, subject, content, recipients, sent_by, sent_at)
      VALUES (?, 'teams', ?, ?, 'all', ?, datetime('now'))
    `).run(uuidv4(), subject, content, req.user.id);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resend email integration
router.post('/email/send', async (req, res) => {
  try {
    const { to, subject, content } = req.body;
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'Resend API key not configured' });
    }
    
    await axios.post(
      'https://api.resend.com/emails',
      {
        from: process.env.FROM_EMAIL || 'PRISM Labs <onboarding@resend.dev>',
        to: to,
        subject: subject,
        html: content
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GitHub integration
router.get('/github/repos', async (req, res) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    const org = process.env.GITHUB_ORG;
    
    if (!token) {
      return res.status(400).json({ error: 'GitHub token not configured' });
    }
    
    const response = await axios.get(`https://api.github.com/users/${org}/repos`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google Calendar integration
router.get('/google/events', async (req, res) => {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    if (!calendarId) {
      return res.status(400).json({ error: 'Google Calendar not configured' });
    }
    
    // Would need proper OAuth token exchange here
    res.json({ events: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Integration status
router.get('/status', (req, res) => {
  const integrations = db.prepare('SELECT * FROM integration_config').all();
  res.json(integrations);
});

router.post('/status/:service', (req, res) => {
  const { service } = req.params;
  const { is_enabled, config } = req.body;
  
  try {
    db.prepare(`
      UPDATE integration_config
      SET is_enabled = ?, config = ?, last_sync = datetime('now')
      WHERE service = ?
    `).run(is_enabled ? 1 : 0, JSON.stringify(config), service);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
