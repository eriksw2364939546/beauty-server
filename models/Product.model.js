import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  categorySlug: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Индексы
productSchema.index({ categorySlug: 1 });
productSchema.index({ title: 'text' });
productSchema.index({ createdAt: -1 });

export default mongoose.model('Product', productSchema);