const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
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
    water: {
        type: Number, // units
        required: true
    },
    electric: {
        type: Number, // units
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['รอการชำระ', 'รอชำระ', 'ชำระแล้ว', 'เกินกำหนด'],
        default: 'รอการชำระ'
    },
    lastPay: {
        type: String,
        default: '-'
    },
    currentWater: {
        type: Number
    },
    currentElectric: {
        type: Number
    },
    dateStart: {
        type: String
    },
    dateEnd: {
        type: String
    },
    meterPeriodStart: {
        type: String
    },
    meterPeriodEnd: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);
