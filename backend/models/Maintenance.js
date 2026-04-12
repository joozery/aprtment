const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true,
        trim: true
    },
    issue: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['ประปา', 'ไฟฟ้า', 'เครื่องปรับอากาศ', 'ทั่วไป'],
        default: 'ทั่วไป'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Done'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    date: {
        type: String, // format: 01 ม.ค. 2567
        required: true
    },
    images: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
