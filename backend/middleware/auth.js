const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'aprtment_super_secret_2025';

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ success: false, error: 'กรุณาเข้าสู่ระบบก่อน' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user || !req.user.isActive) {
            return res.status(401).json({ success: false, error: 'Token ไม่ถูกต้อง' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Token หมดอายุหรือไม่ถูกต้อง' });
    }
};
