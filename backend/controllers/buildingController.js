const Building = require('../models/Building');
const Room = require('../models/Room');

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
            floors,
            roomsPerFloor,
            defaultRent,
            address,
            taxId
        });

        // Save the building so we have an _id for rooms
        const savedBuilding = await building.save();

        const generatedRooms = [];

        // Generate rooms logic: 4-digits: [BuildingIndex][Floor][RoomNumber] 
        // Ex: building=1, f=1, r=1 => 1101
        for (let f = 1; f <= floors; f++) {
            for (let r = 1; r <= roomsPerFloor; r++) {
                // Convert numbers to 4-digit format string.
                const roomNum = `${buildingIndex}${f}${r.toString().padStart(2, '0')}`;

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

        const building = await Building.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!building) {
            return res.status(404).json({ success: false, error: 'Building not found' });
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
