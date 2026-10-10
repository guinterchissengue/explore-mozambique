const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

const SALT_ROUNDS = 10;
// Only safe fields are ever returned to the client (never passwordHash)
const publicUser = (u) => ({
  id: u.id || String(u._id),
  username: u.username,
  displayName: u.displayName,
  email: u.email,
  avatarUrl: u.avatarUrl,
  provider: u.provider,
  role: u.role,
  createdAt: u.createdAt,
  lastLogin: u.lastLogin
});
const serverError = (res) => res.status(500).json({ success: false, message: 'Internal server error' });

// POST /auth/register  -> create a local account (password stored as a bcrypt hash)
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      username,
      displayName: username,
      email,
      passwordHash,
      provider: 'local'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. You can now log in.',
      data: publicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((e) => e.message)
      });
    }
    console.error('Register error:', error.message);
    serverError(res);
  }
};

// POST /auth/login  -> start a session
const login = (req, res) => {
  try {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.error('Login error:', err.message);
        return serverError(res);
      }
      if (!user) {
        return res.status(401).json({
          success: false,
          message: (info && info.message) || 'Invalid email or password'
        });
      }
      req.login(user, async (loginErr) => {
        try {
          if (loginErr) throw loginErr;
          await User.findByIdAndUpdate(user.id, { lastLogin: new Date() });
          res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: { id: user.id, username: user.username, email: user.email, provider: user.provider }
          });
        } catch (e) {
          console.error('Login session error:', e.message);
          serverError(res);
        }
      });
    })(req, res);
  } catch (error) {
    serverError(res);
  }
};

// POST /auth/logout (also GET)  -> end the session
const logout = (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err.message);
        return serverError(res);
      }
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
      });
    });
  } catch (error) {
    serverError(res);
  }
};

// GET /auth/profile  (protected)
const profile = (req, res) => {
  try {
    res.status(200).json({ success: true, data: publicUser(req.user) });
  } catch (error) {
    serverError(res);
  }
};

// GET /auth/status  (public)
const status = (req, res) => {
  try {
    const authenticated = !!(req.isAuthenticated && req.isAuthenticated());
    res.status(200).json({
      success: true,
      authenticated,
      user: authenticated ? { id: req.user.id, username: req.user.username, provider: req.user.provider } : null
    });
  } catch (error) {
    serverError(res);
  }
};

module.exports = { register, login, logout, profile, status };
