const db = require('../db');

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Please log in to access this page');
  res.redirect('/auth/login');
}

function requireAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Access denied. Admin privileges required.');
  res.redirect('/members/dashboard');
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (req.isAuthenticated() && roles.includes(req.user.role)) {
      return next();
    }
    req.flash('error', 'Access denied. Insufficient privileges.');
    res.redirect('/members/dashboard');
  };
}

function loadUser(req, res, next) {
  if (req.user) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (user) {
      req.user = user;
    }
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireRole,
  loadUser
};
