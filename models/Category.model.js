import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
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
  section: {
    type: String,
    enum: ['service', 'work', 'price', 'product'],
    required: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

// Индексы
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ section: 1, sortOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);