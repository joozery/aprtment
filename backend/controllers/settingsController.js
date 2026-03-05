const Settings = require('../models/Settings');

// GET settings (always return global singleton)
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ key: 'global' });
        if (!settings) {
            settings = await Settings.create({ key: 'global' });
        }
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// PUT settings (upsert global singleton)
exports.updateSettings = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { key: 'global' },
            { $set: req.body },
            { new: true, upsert: true, runValidators: true }
        );
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
