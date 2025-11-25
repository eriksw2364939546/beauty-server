import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
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
serviceSchema.index({ slug: 1 }, { unique: true });
serviceSchema.index({ categorySlug: 1 });
serviceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Service', serviceSchema);