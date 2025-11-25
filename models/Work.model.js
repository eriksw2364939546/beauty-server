import mongoose from "mongoose";

const workSchema = new mongoose.Schema({
  image: {
    large: {
      type: String,
      required: true
    },
    medium: {
      type: String,
      required: true
    },
    thumb: {
      type: String,
      required: true
    }
  },
  categorySlug: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Индексы
workSchema.index({ categorySlug: 1 });
workSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Work', workSchema);