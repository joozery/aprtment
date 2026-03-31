const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    floors: {
        type: Number,
        required: true,
        min: 1
    },
    roomsPerFloor: {
        type: Number,
        required: true,
        min: 1
    },
    defaultRent: {
        type: Number,
        required: true,
        min: 0
    },
    address: {
        type: String,
        default: '' // ที่อยู่สำหรับตีพิมพ์บนบิล
    },
    taxId: {
        type: String,
        default: '' // เลขประจำตัวผู้เสียภาษี (ถ้ามี)
    },
    prefix: {
        type: String,
        default: '' // เลขนำหน้าห้อง (เช่น A, B หรือเลข 1, 2)
    },
    // อัตราค่าน้ำไฟประจำตึก (ถ้ามี จะใช้เป็นค่าเริ่มต้นเหนือ settings)
    waterRate: {
        type: Number,
        default: null
    },
    electricRate: {
        type: Number,
        default: null
    },
    waterMin: {
        type: Number,
        default: null
    },
    electricMin: {
        type: Number,
        default: null
    },
    serviceFee: {
        type: Number,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Building', buildingSchema);
