import mongoose from 'mongoose';

const workSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Индексы
workSchema.index({ category: 1 });
workSchema.index({ createdAt: -1 });

export default mongoose.model('Work', workSchema);