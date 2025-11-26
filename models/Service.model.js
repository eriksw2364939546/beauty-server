import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,  // Уже создаёт индекс
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

// Индексы (только дополнительные)
serviceSchema.index({ categorySlug: 1 });
serviceSchema.index({ createdAt: -1 });

export default mongoose.model('Service', serviceSchema);