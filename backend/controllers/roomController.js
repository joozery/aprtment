const Room = require('../models/Room');
const Tenant = require('../models/Tenant');

// Get all rooms
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ number: 1 });
        res.status(200).json({ success: true, data: rooms });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Create a room (manual)
exports.createRoom = async (req, res) => {
    try {
        const room = new Room(req.body);
        await room.save();
        res.status(201).json({ success: true, data: room });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
