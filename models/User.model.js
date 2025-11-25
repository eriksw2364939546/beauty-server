import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  }
}, {
  timestamps: true,
  versionKey: false
});

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);