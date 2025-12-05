import mongoose from 'mongoose';

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
  },
  section: {
    type: String,
    enum: ['service', 'price', 'product'],
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


categorySchema.index({ section: 1, sortOrder: 1 });

export default mongoose.model('Category', categorySchema);