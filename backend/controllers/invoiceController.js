const Invoice = require('../models/Invoice');
const Tenant = require('../models/Tenant');

// Get all invoices
exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.json({ success: true, data: invoices });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Create new invoice (billing) - upserts if unpaid invoice for same room/month exists
exports.createInvoice = async (req, res) => {
    try {
        const { room, water, electric, total, status, dateStart, dateEnd, currentWater, currentElectric } = req.body;

        const tenant = await Tenant.findOne({ room });
        if (!tenant) {
            return res.status(404).json({ success: false, error: 'Tenant not found' });
        }

        // Check if there's already an unpaid invoice for this room in the current calendar month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const existingInvoice = await Invoice.findOne({
            room,
            status: { $ne: 'ชำระแล้ว' },
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        let invoice;
        if (existingInvoice) {
            // Update existing invoice instead of creating a duplicate
            invoice = await Invoice.findByIdAndUpdate(existingInvoice._id, {
                water,
                electric,
                total,
                currentWater,
                currentElectric,
                dateStart,
                dateEnd,
                status: status || existingInvoice.status,
            }, { new: true });
        } else {
            // Create a new invoice
            invoice = await Invoice.create({
                room,
                buildingId: tenant.buildingId,
                name: tenant.name,
                water,
                electric,
                total,
                status: status || 'รอการชำระ',
                dateStart,
                dateEnd,
                currentWater,
                currentElectric
            });
        }

        // Update tenant's last meters
        if (currentWater !== undefined) tenant.lastWaterMeter = currentWater;
        if (currentElectric !== undefined) tenant.lastElectricMeter = currentElectric;
        await tenant.save();

        res.status(201).json({ success: true, data: invoice });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


// Pay bill
exports.payInvoice = async (req, res) => {
    try {
        const { room } = req.params;
        const lastPay = req.body.lastPay || new Date().toLocaleDateString('th-TH');

        // Allow multiple unpaid invoices for same room? Usually find the pending one
        const invoice = await Invoice.updateMany({ room, status: { $ne: 'ชำระแล้ว' } }, {
            status: 'ชำระแล้ว',
            lastPay
        });

        // fetch all invoices to send back updated?
        // or just return success
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
        res.json({ success: true, data: invoice });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
