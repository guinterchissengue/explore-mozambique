const express = require('express');
const passport = require('passport');
const router = express.Router();

const { register, login, logout, profile, status } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { requireAuth } = require('../middleware/auth');

const githubConfigured = () => !!passport._strategy('github');

// ---- GitHub OAuth ----
router.get('/github', (req, res, next) => {
  if (!githubConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'GitHub OAuth is not configured on this server (missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET)'
    });
  }
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

router.get(
  '/github/callback',
  (req, res, next) => {
    if (!githubConfigured()) {
      return res.status(503).json({ success: false, message: 'GitHub OAuth is not configured on this server' });
    }
    passport.authenticate('github', { failureRedirect: '/auth/failure' })(req, res, next);
  },
  (req, res) => res.redirect('/api-docs')
);

router.get('/failure', (req, res) =>
  res.status(401).json({ success: false, message: 'GitHub authentication failed' })
);

// ---- Local accounts ----
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.route('/logout').post(logout).get(logout);

// ---- Session info ----
router.get('/status', status);
router.get('/profile', requireAuth, profile); // protected

module.exports = router;
