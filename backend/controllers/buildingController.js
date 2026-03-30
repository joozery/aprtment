const Building = require('../models/Building');
const Room = require('../models/Room');
const Tenant = require('../models/Tenant');
const Invoice = require('../models/Invoice');

// Clear all data for a building (tenants & rooms)
exports.clearBuildingData = async (req, res) => {
    try {
        const { id } = req.params;
        const building = await Building.findById(id);

        if (!building) {
            return res.status(404).json({ success: false, error: 'Building not found' });
        }

        // 1. Delete all tenants assigned to rooms in this building
        const rooms = await Room.find({ buildingId: id });
        const roomNumbers = rooms.map(r => r.number);
        
        await Tenant.deleteMany({ buildingId: id }); // Delete by buildingId for safety
        
        // 2. Delete all rooms
        await Room.deleteMany({ buildingId: id });

        res.status(200).json({ success: true, message: 'All building data cleared' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

// Get all buildings
exports.getBuildings = async (req, res) => {
    try {
        const buildings = await Building.find();
        res.status(200).json({ success: true, count: buildings.length, data: buildings });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

// Create new building
exports.createBuilding = async (req, res) => {
    try {
        const building = await Building.create(req.body);

        // Generate rooms automatically
        const rooms = [];
        const prefix = building.prefix !== undefined && building.prefix !== '' ? building.prefix : (await Building.countDocuments());

        for (let f = 1; f <= building.floors; f++) {
            for (let r = 1; r <= building.roomsPerFloor; r++) {
                const roomNum = `${prefix}${f}${r.toString().padStart(2, '0')}`;
                rooms.push({
                    number: roomNum,
                    buildingId: building._id,
                    floor: f,
                    rent: building.defaultRent,
                    status: 'vacant'
                });
            }
        }

        await Room.insertMany(rooms);

        res.status(201).json({ success: true, data: building });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

// Get single building
exports.getBuilding = async (req, res) => {
    try {
        const building = await Building.findById(req.params.id);
        if (!building) {
            return res.status(404).json({ success: false, error: 'Building not found' });
        }
        res.status(200).json({ success: true, data: building });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

// Update building
exports.updateBuilding = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const building = await Building.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!building) {
            return res.status(404).json({ success: false, error: 'Building not found' });
        }

        // Automatically synchronize all dependent rooms, tenants, and bills
        try {
            const actualPrefix = building.prefix !== undefined ? building.prefix : '';
            const roomsInBuilding = await Room.find({ buildingId: id }).sort({ number: 1 });
            
            for (const r of roomsInBuilding) {
                try {
                    const sequencePart = r.number.toString().slice(-2);
                    const floorPart = r.floor || r.number.toString().slice(actualPrefix.length, -2) || '1';
                    const expectedRoomName = `${actualPrefix}${floorPart}${sequencePart}`;

                    if (expectedRoomName !== r.number) {
                        const oldRoomName = r.number;
                        
                        // Use buildingId + room name to be extremely specific about which tenants to update
                        await Tenant.updateMany(
                            { buildingId: id, room: oldRoomName }, 
                            { $set: { room: expectedRoomName } }
                        );
                        
                        await Invoice.updateMany(
                            { buildingId: id, room: oldRoomName }, 
                            { $set: { room: expectedRoomName } }
                        );
                        
                        r.number = expectedRoomName;
                        await r.save();
                        console.log(`Successfully synced room ${oldRoomName} -> ${expectedRoomName}`);
                    }
                } catch (roomError) {
                    console.error(`Error syncing room ${r.number}:`, roomError.message);
                }
            }
        } catch (syncError) {
            console.error('Prefix sync error:', syncError.message);
        }

        res.status(200).json({ success: true, data: building });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

// Delete building
exports.deleteBuilding = async (req, res) => {
    try {
        const { id } = req.params;

        const building = await Building.findByIdAndDelete(id);

        if (!building) {
            return res.status(404).json({ success: false, error: 'Building not found' });
        }

        // Delete associated rooms
        await Room.deleteMany({ buildingId: id });

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}
