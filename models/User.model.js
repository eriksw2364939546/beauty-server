import mongoose from 'mongoose';

const masterSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  speciality: {
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
  }
}, {
  timestamps: true,
  versionKey: false
});

// Индексы
masterSchema.index({ slug: 1 }, { unique: true });
masterSchema.index({ createdAt: -1 });

export default mongoose.model('Master', masterSchema);