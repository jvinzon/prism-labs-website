const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/member');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const integrationRoutes = require('./routes/integrations');

// Import middleware
const { requireAuth, requireAdmin, requireRole } = require('./middleware/auth');
const { trackAnalytics } = require('./middleware/analytics');

// Passport setup
require('./config/passport');

// View engine setup (using EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
const sessionStore = new SQLiteStore({
  db: 'sessions.db',
  dir: './data'
});

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Analytics tracking
app.use(trackAnalytics);

// Make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/members', requireAuth, memberRoutes);
app.use('/admin', requireAdmin, adminRoutes);
app.use('/api', apiRoutes);
app.use('/integrations', requireAdmin, integrationRoutes);

// Home page
app.get('/', (req, res) => {
  if (req.user) {
    return res.redirect(req.user.role === 'admin' ? '/admin/dashboard' : '/members/dashboard');
  }
  res.render('index', {
    title: 'PRISM Labs - Where Curiosity Becomes Capability',
    description: 'Technology club at ASDAH. Four tracks: Programming, Refurbishing, Innovation, Systems Management.'
  });
});

// Public resources page
app.get('/resources', (req, res) => {
  const resources = db.prepare('SELECT * FROM resources WHERE is_published = 1 ORDER BY created_at DESC LIMIT 12').all();
  res.render('resources-public', {
    title: 'Resource Library - PRISM Labs',
    resources
  });
});

// Public events calendar
app.get('/calendar', (req, res) => {
  const events = db.prepare(`
    SELECT * FROM events 
    WHERE start_time >= datetime('now') 
    ORDER BY start_time ASC 
    LIMIT 20
  `).all();
  res.render('calendar-public', {
    title: 'Events Calendar - PRISM Labs',
    events
  });
});

// Join page
app.get('/join', (req, res) => {
  res.render('join', {
    title: 'Join PRISM Labs',
    description: 'Sign up to become a member'
  });
});

// About page
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'About PRISM Labs',
    description: 'Learn about our mission and tracks'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Something Went Wrong',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🌈 PRISM Labs Server running on http://localhost:${PORT}`);
  console.log(`\n📊 Database: ${process.env.DATABASE_PATH || './data/prism-labs.db'}`);
  console.log(`\n🚀 Ready to launch!\n`);
});
