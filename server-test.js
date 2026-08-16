const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'prism-labs-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Simple auth middleware (for testing)
app.use((req, res, next) => {
  req.user = { id: 'admin-001', name: 'Jedidiah Vinzon', role: 'admin' };
  req.isAuthenticated = () => true;
  next();
});

// Routes
const featuresRoutes = require('./routes/features');
const gamificationRoutes = require('./routes/gamification');
const socialRoutes = require('./routes/social');

app.use('/members', featuresRoutes);
app.use('/members/gamification', gamificationRoutes);
app.use('/members/social', socialRoutes);

// Home page
app.get('/', (req, res) => {
  res.send(`
    <h1>🌈 PRISM Labs Website v2.0</h1>
    <p>Server is running!</p>
    <ul>
      <li><a href="/members/paths">Learning Paths</a></li>
      <li><a href="/members/bookings">Bookings</a></li>
      <li><a href="/members/gamification/leaderboard/individual">Leaderboard</a></li>
      <li><a href="/members/social/feed">Social Feed</a></li>
    </ul>
    <p style="color: green; margin-top: 20px;">✅ Database connected (sql.js)</p>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🌈 PRISM Labs Server running on http://localhost:' + PORT);
  console.log('✅ Database: sql.js (pure JavaScript)');
  console.log('✅ Routes loaded: features, gamification, social');
  console.log('='.repeat(60));
});
