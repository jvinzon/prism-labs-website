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

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'prism-labs-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Flash messages
app.use(flash());

// Make messages and user available to all templates
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
const adminRoutes = require('./routes/admin');

// Load routes
app.use('/', authRoutes);
app.use('/admin', adminRoutes);

// Home page
app.get('/', (req, res) => {
  res.render('index', {
    title: 'PRISM Labs - Where Curiosity Becomes Capability'
  });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).render('index', {
    title: '404 - Page Not Found',
    messages: [{ type: 'error', message: 'Page not found: ' + req.path }]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('🌈 PRISM Labs Server running on http://localhost:' + PORT);
  console.log('='.repeat(70));
  console.log('');
  console.log('📍 Available Routes:');
  console.log('   Homepage:       http://localhost:' + PORT + '/');
  console.log('   Member Login:   http://localhost:' + PORT + '/members/login');
  console.log('   Admin Login:    http://localhost:' + PORT + '/admin/login');
  console.log('   Admin Dashboard: http://localhost:' + PORT + '/admin/dashboard');
  console.log('');
  console.log('🔐 Test Admin Credentials:');
  console.log('   Email: ' + (process.env.ADMIN_EMAIL || 'jedidiah@asdah.school.nz'));
  console.log('   PIN:   ' + (process.env.ADMIN_PIN || '123456'));
  console.log('='.repeat(70));
});
