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
    unique: true,
    lowercase: true
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
  }
}, {
  timestamps: true,
  versionKey: false
});

// Индексы
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ code: 1 }, { unique: true });
productSchema.index({ categorySlug: 1 });
productSchema.index({ title: 'text' }); // Для поиска по названию
productSchema.index({ createdAt: -1 });

export default mongoose.model('Product', productSchema);