const express = require('express');
const cors = require('cors');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');

const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const placesRoutes = require('./routes/places');
const reviewsRoutes = require('./routes/reviews');
const { notFound, errorHandler } = require('./middleware/errorHandler');

let swaggerDocument = {};
try {
  swaggerDocument = require('./Swagger.json');
} catch (error) {
  console.warn('Swagger.json missing or invalid JSON.');
}

// sessionStore: a connect-mongo store in production (sessions saved in MongoDB). Memory store only for tests.
const buildApp = ({ sessionStore } = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const secret = process.env.SESSION_SECRET || (isProduction ? null : 'dev-only-secret-change-me');
  if (!secret) {
    throw new Error('SESSION_SECRET is not set. Add it in the Render Environment tab.');
  }

  const app = express();
  app.set('trust proxy', 1); // Render sits behind a proxy (needed for secure cookies / https callbacks)

  app.use(cors());
  app.use(express.json());

  app.use(
    session({
      name: 'connect.sid',
      secret,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
      }
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Open Swagger UI directly from the main link
  app.get('/', (req, res) => res.redirect('/api-docs'));

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'Explore Mozambique API - Docs',
      swaggerOptions: { displayRequestDuration: true }
    })
  );
  app.get('/Swagger.json', (req, res) => res.json(swaggerDocument));

  // Health check: which database is connected (no credentials)
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      status: 'ok',
      database: mongoose.connection.name,
      dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });

  app.use('/auth', authRoutes);
  app.use('/places', placesRoutes);
  app.use('/reviews', reviewsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = buildApp;
