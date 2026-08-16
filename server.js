const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (using memory store for simplicity - works with sql.js)
app.use(session({
  secret: process.env.SESSION_SECRET || 'prism-labs-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages
app.use(flash());

// Make messages available to all templates
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.session.user || null;
  next();
});

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const authRoutes = require('./routes/auth');
const featuresRoutes = require('./routes/features');
const adminRoutes = require('./routes/admin');

app.use('/', authRoutes);
app.use('/', featuresRoutes);
app.use('/', adminRoutes);

// Home page
app.get('/', (req, res) => {
  res.render('index', {
    title: 'PRISM Labs - Where Curiosity Becomes Capability'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('🌈 PRISM Labs Server running on http://localhost:' + PORT);
  console.log('='.repeat(70));
  console.log('');
  console.log('📍 Navigation:');
  console.log('   Member Login: http://localhost:' + PORT + '/members/login');
  console.log('   Admin Login:  http://localhost:' + PORT + '/admin/login (footer link)');
  console.log('');
  console.log('🔐 Test Credentials:');
  console.log('   Admin Email: ' + (process.env.ADMIN_EMAIL || 'jedidiah@asdah.school.nz'));
  console.log('   Admin PIN:    ' + (process.env.ADMIN_PIN || '123456'));
  console.log('='.repeat(70));
});
