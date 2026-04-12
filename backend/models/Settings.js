const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    key: { type: String, default: 'global', unique: true },
    waterRate: { type: Number, default: 35 },
    electricRate: { type: Number, default: 11 },
    waterMin: { type: Number, default: 200 },
    electricMin: { type: Number, default: 200 },
    serviceFee: { type: Number, default: 200 },
    defaultRent: { type: Number, default: 4500 },
    promptpayPhone: { type: String, default: '' },
    contractConfig: {
        title: { type: String, default: 'สัญญาเช่าห้องพักอาศัย' },
        lessorName: { type: String, default: 'หอพักตวงเงินแมนชั่น' },
        terms: [{ type: String }]
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
