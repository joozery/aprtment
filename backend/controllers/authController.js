const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'aprtment_super_secret_2025';
const JWT_EXPIRE = '7d';

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

// Register (first-time setup or admin-only)
exports.register = async (req, res) => {
    try {
        const { username, password, displayName, role } = req.body;
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Username นี้ถูกใช้แล้ว' });
        }
        const user = await User.create({ username, password, displayName, role });
        const token = signToken(user._id);
        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, username: user.username, displayName: user.displayName, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'กรุณากรอก username และ password' });
        }
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
        const token = signToken(user._id);
        res.json({
            success: true,
            token,
            user: { id: user._id, username: user.username, displayName: user.displayName, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get me (verify token)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'รหัสผ่านเดิมไม่ถูกต้อง' });
        }
        user.password = newPassword;
        await user.save();
        res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Get all users (admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { displayName, role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { displayName, role, isActive },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ success: false, error: 'ไม่พบผู้ใช้' });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
