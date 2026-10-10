const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3 },
    displayName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    // bcrypt hash only. Plain-text passwords are NEVER stored. Not returned by queries by default.
    passwordHash: { type: String, select: false },
    githubId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String, trim: true },
    provider: { type: String, enum: ['local', 'github'], default: 'local' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    lastLogin: { type: Date }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('User', userSchema);
