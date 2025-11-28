import mongoose from 'mongoose';

const masterSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  speciality: {
    type: String,
    required: true,
    trim: true
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
masterSchema.index({ createdAt: -1 });

export default mongoose.model('Master', masterSchema);