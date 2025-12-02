import mongoose from 'mongoose';

const workSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
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
workSchema.index({ service: 1 });
workSchema.index({ createdAt: -1 });

export default mongoose.model('Work', workSchema);