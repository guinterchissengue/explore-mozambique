// Protects a route: the request must come from a logged-in user (session cookie).
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required. Log in with GitHub (/auth/github) or POST /auth/login first.'
  });
};

module.exports = { requireAuth };
