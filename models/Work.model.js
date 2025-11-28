import mongoose from 'mongoose';

const workSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
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

export default mongoose.model('Work', workSchema);