import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
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
priceSchema.index({ service: 1, sortOrder: 1 });
priceSchema.index({ createdAt: -1 });

export default mongoose.model('Price', priceSchema);