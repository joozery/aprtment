const Maintenance = require('../models/Maintenance');

exports.getMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: maintenance.length,
            data: maintenance
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

exports.addMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.create(req.body);
        res.status(201).json({
            success: true,
            data: maintenance
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

exports.updateMaintenanceStatus = async (req, res) => {
    try {
        const maintenance = await Maintenance.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                error: 'No maintenance found'
            });
        }

        res.status(200).json({
            success: true,
            data: maintenance
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

exports.deleteMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.findByIdAndDelete(req.params.id);

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                error: 'No maintenance found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
