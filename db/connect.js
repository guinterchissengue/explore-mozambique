const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || !/^mongodb(\+srv)?:\/\//.test(uri)) {
    // Do not print the value: it may contain credentials
    throw new Error('MONGODB_URI is missing or invalid. Set it in .env (local) or in the Render Environment tab.');
  }
  const conn = await mongoose.connect(uri);
  // Host + database name only (no credentials) so you can confirm WHICH database is in use
  console.log(`MongoDB connected -> host: ${conn.connection.host} | database: ${conn.connection.name}`);
  return conn;
};

module.exports = connectDB;
