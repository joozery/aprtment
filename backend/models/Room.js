const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true // 1101, 2101
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

module.exports = mongoose.model('Room', roomSchema);
