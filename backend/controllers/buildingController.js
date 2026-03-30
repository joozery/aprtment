const Building = require('../models/Building');
const Room = require('../models/Room');
const Tenant = require('../models/Tenant');
const Invoice = require('../models/Invoice');

// Clear all data for a building (tenants & rooms)
exports.clearBuildingData = async (req, res) => {
    try {
        const { id } = req.params;
        const building = await Building.findById(id);
        if (!building) return res.status(404).json({ success: false, error: 'Building not found' });

        // Delete all tenants and rooms
        await Tenant.deleteMany({ buildingId: id });
        await Room.deleteMany({ buildingId: id });

        // Optionally re-generate default rooms if building has floors/rooms defined
        const generatedRooms = [];
        for (let f = 1; f <= building.floors; f++) {
            for (let r = 1; r <= building.roomsPerFloor; r++) {
                // Determine prefix from building count or some other logic
                // For simplicity, we can use a helper or just skip re-generation and let import handle it
            }
        }
        
        res.status(200).json({ success: true, message: 'Building data cleared successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Create a new Building and auto-generate rooms
exports.createBuilding = async (req, res) => {
    try {
        const { name, floors, roomsPerFloor, defaultRent, address, taxId } = req.body;

        // Ensure we handle building ID correctly since the UI uses 1-based indices right now
        // A robust way mapping to the logic: we need an identifier for Prefix like '1', '2' etc.
        // I will add a 'buildingIndex' to Building model later if needed, but for now we can rely on how many buildings exist to calculate a prefix.
        const totalBuildings = await Building.countDocuments();
        const buildingIndex = totalBuildings + 1; // 1, 2, 3...

        const building = new Building({
            name,
            prefix: req.body.prefix || '',
            floors,
            roomsPerFloor,
            defaultRent,
            address,
            taxId
        });

        // Save the building so we have an _id for rooms
        const savedBuilding = await building.save();

        const generatedRooms = [];

        // Generate rooms logic using prefix or buildingIndex
        const actualPrefix = building.prefix || buildingIndex;
        for (let f = 1; f <= floors; f++) {
            for (let r = 1; r <= roomsPerFloor; r++) {
                // Convert numbers to formatted room string.
                const roomNum = `${actualPrefix}${f}${r.toString().padStart(2, '0')}`;

                generatedRooms.push({
                    number: roomNum,
                    buildingId: savedBuilding._id,
                    floor: f,
                    rent: defaultRent, // fallback default
                });
            }
        }

        // Batch insert rooms
        await Room.insertMany(generatedRooms);

        res.status(201).json({
            success: true,
            data: savedBuilding,
            message: `Building and ${generatedRooms.length} rooms generated.`
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get all buildings
exports.getBuildings = async (req, res) => {
    try {
        const buildings = await Building.find().sort({ createdAt: 1 });
        res.status(200).json({ success: true, data: buildings });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Update building
exports.updateBuilding = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const oldBuilding = await Building.findById(id);
        const oldPrefix = oldBuilding?.prefix || '';

        const building = await Building.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!building) {
            return res.status(404).json({ success: false, error: 'Building not found' });
        }

        // Automatically synchronize all dependent rooms, tenants, and bills
        // We do this aggressively because the DB might have been out-of-sync before this feature existed!
        const actualPrefix = building.prefix || '';
        const roomsInBuilding = await Room.find({ buildingId: id });
        
        for (const r of roomsInBuilding) {
            // Room sequence is the last 2 digits for cases where roomsPerFloor < 100
            const sequenceNum = r.number.slice(-2);
            
            // If prefix is completely empty, it shouldn't fallback to '' if it was supposed to be buildingIndex
            // But since the user explicitly wants '3', actualPrefix is '3'. 
            // If actualPrefix is empty, it uses fallback from index. 
            // We use actualPrefix directly here since it matches frontend logic.
            const expectedRoomName = `${actualPrefix}${r.floor}${sequenceNum}`;

            if (expectedRoomName !== r.number) {
                const oldRoomName = r.number;
                // Update Tenants and Invoices using the old room number to the new one
                await Tenant.updateMany({ buildingId: id, room: oldRoomName }, { $set: { room: expectedRoomName } });
                await Invoice.updateMany({ buildingId: id, room: oldRoomName }, { $set: { room: expectedRoomName } });
                
                // Update Room Document
                r.number = expectedRoomName;
                await r.save();
            }
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

        // Note: Realistically, you want to also delete rooms / tenants or prevent delete if not empty.
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
};
