require('dotenv').config();
const MongoStore = require('connect-mongo');
const connectDB = require('./db/connect');
const buildApp = require('./app');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    // Sessions are stored in MongoDB (collection "sessions") so logins survive restarts
    const sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 60 * 60 * 24
    });

    const app = buildApp({ sessionStore });
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger Docs available at: /api-docs (port ${PORT})`);
      console.log(`GitHub OAuth: ${process.env.GITHUB_CLIENT_ID ? 'configured' : 'NOT configured'}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
