const Tenant = require('../models/Tenant');
const Room = require('../models/Room');
const Building = require('../models/Building');

// Get all tenants
exports.getTenants = async (req, res) => {
    try {
        const tenants = await Tenant.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: tenants });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Create a new tenant check room first
exports.createTenant = async (req, res) => {
    try {
        const { room, name, rent, status, date, expiry, phone } = req.body;

        // Verify if room exists and get building id
        const roomData = await Room.findOne({ number: room });

        if (!roomData) {
            return res.status(404).json({ success: false, error: 'Room does not exist' });
        }

        if (roomData.status !== 'vacant') {
            return res.status(400).json({ success: false, error: 'Room is already occupied or under maintenance' });
        }

        const avatar = name.substring(0, 2).toUpperCase();

        const tenant = new Tenant({
            room,
            buildingId: roomData.buildingId,
            name,
            rent: rent || roomData.rent,
            status: status || 'ปกติ',
            date,
            expiry,
            phone,
            avatar
        });

        await tenant.save();

        // Update room status
        roomData.status = 'occupied';
        await roomData.save();

        res.status(201).json({ success: true, data: tenant });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.deleteTenant = async (req, res) => {
    try {
        const { id } = req.params;
        const tenant = await Tenant.findById(id);

        if (!tenant) {
            return res.status(404).json({ success: false, error: 'Tenant not found' });
        }

        const roomData = await Room.findOne({ number: tenant.room, buildingId: tenant.buildingId });

        await Tenant.findByIdAndDelete(id);

        if (roomData) {
            roomData.status = 'vacant';
            await roomData.save();
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.updateTenant = async (req, res) => {
    try {
        const { id } = req.params;
        const tenant = await Tenant.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!tenant) {
            return res.status(404).json({ success: false, error: 'Tenant not found' });
        }

        res.status(200).json({ success: true, data: tenant });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
