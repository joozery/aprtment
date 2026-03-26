const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true,
        trim: true
    },
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['ปกติ', 'ใกล้หมดสัญญา', 'ค้างชำระ', 'ยกเลิก', 'ย้ายออก'],
        default: 'ปกติ'
    },
    date: {
        type: String, // format: 01 ม.ค. 2024
        required: true
    },
    expiry: {
        type: String,
        required: true
    },
    rent: {
        type: Number,
        required: true
    },
    avatar: {
        type: String // SJ, PT etc.
    },
    phone: {
        type: String
    },
    lastWaterMeter: {
        type: Number,
        default: 0
    },
    lastElectricMeter: {
        type: Number,
        default: 0
    },
    nationality: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Tenant', tenantSchema);
