// Authentication middleware

// Check if user is authenticated
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Please log in to access this page');
  res.redirect('/members/login');
}

// Check if user is admin
async function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    req.flash('error', 'Please log in');
    return res.redirect('/admin/login');
  }
  
  if (!req.session.isAdmin) {
    req.flash('error', 'Access denied. Admin privileges required.');
    return res.redirect('/members/dashboard');
  }
  
  return next();
}

module.exports = {
  requireAuth,
  requireAdmin
};
