const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        default: 'Standard'
    },
    size: {
        type: String,
        default: '24'
    },
    rent: {
        type: Number,
        required: true
    },
    features: {
        type: [String],
        default: ['แอร์', 'เครื่องทำน้ำอุ่น', 'เฟอร์นิเจอร์']
    },
    status: {
        type: String,
        enum: ['vacant', 'occupied', 'maintenance'],
        default: 'vacant'
    }
}, {
    timestamps: true
});

// Ensure room number is unique WITHIN a building, not across all buildings
roomSchema.index({ buildingId: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
