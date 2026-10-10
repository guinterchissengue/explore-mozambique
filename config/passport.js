const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: GitHubStrategy } = require('passport-github2');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});

// ---- Local strategy: email + password (password compared against the bcrypt hash) ----
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: String(email).toLowerCase() }).select('+passwordHash');
      if (!user || !user.passwordHash) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return done(null, false, { message: 'Invalid email or password' });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// ---- GitHub OAuth strategy (only enabled when the OAuth app credentials exist) ----
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || '/auth/github/callback',
        scope: ['user:email'],
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
          let user = await User.findOne({ githubId: profile.id });

          if (!user && email) {
            // Same e-mail already registered locally: link the GitHub account to it
            user = await User.findOne({ email: email.toLowerCase() });
            if (user) user.githubId = profile.id;
          }

          if (!user) {
            user = new User({
              githubId: profile.id,
              username: profile.username || `github-${profile.id}`,
              displayName: profile.displayName || profile.username,
              email,
              avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
              provider: 'github'
            });
          }
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

module.exports = passport;
