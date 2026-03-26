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

// Bulk Import Tenants
exports.bulkImportTenants = async (req, res) => {
    try {
        const { buildingId, tenantsData } = req.body;
        
        if (!buildingId || !tenantsData || !Array.isArray(tenantsData)) {
            return res.status(400).json({ success: false, error: 'Invalid data format' });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        const today = new Date();
        const dateStr = today.toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' });
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        const expiryStr = expiryDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' });

        for (const data of tenantsData) {
            try {
                // Skip if room or name is missing
                if (!data.room || !data.name) {
                    results.failed++;
                    results.errors.push(`Missing room or name for row: ${JSON.stringify(data)}`);
                    continue;
                }

                // 1. Check if room exists for this building, if not, create it
                let roomData = await Room.findOne({ number: String(data.room), buildingId });
                
                if (!roomData) {
                    // Estimate floor from room number (e.g., 1101 -> floor 1)
                    let floorNum = 1;
                    const roomStr = String(data.room);
                    if (roomStr.length >= 4) {
                        // e.g. "1101" -> floor = parseInt("11") = 11, but really 2nd digit
                        floorNum = parseInt(roomStr.substring(1, roomStr.length - 2)) || 1;
                    } else if (roomStr.length >= 3) {
                        floorNum = parseInt(roomStr.substring(0, roomStr.length - 2)) || 1;
                    }

                    roomData = new Room({
                        number: String(data.room),
                        buildingId,
                        floor: floorNum,
                        rent: data.rent || 4500,
                        status: 'vacant'
                    });
                    await roomData.save();
                }

                // 2. Check and Create/Update Tenant
                const avatar = String(data.name).substring(0, 2).toUpperCase();
                const tenantData = {
                    room: String(data.room),
                    buildingId,
                    name: String(data.name),
                    nationality: String(data.nationality || ''),
                    rent: Number(data.rent) || roomData.rent,
                    lastElectricMeter: Number(data.lastElectricMeter) || 0,
                    lastWaterMeter: Number(data.lastWaterMeter) || 0,
                    status: 'ปกติ',
                    date: data.date || dateStr,
                    expiry: data.expiry || expiryStr,
                    avatar
                };

                // See if tenant already exists in this room/building
                const existingTenant = await Tenant.findOne({ room: data.room, buildingId });
                if (existingTenant) {
                    // Update existing
                    Object.assign(existingTenant, tenantData);
                    await existingTenant.save();
                } else {
                    // Create new
                    const tenant = new Tenant(tenantData);
                    await tenant.save();
                }

                // 4. Update Room status
                roomData.status = 'occupied';
                if (data.rent && data.rent > 0) roomData.rent = Number(data.rent);
                await roomData.save();

                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push(`Error processing room ${data.room}: ${err.message}`);
            }
        }

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
