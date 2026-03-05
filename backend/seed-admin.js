require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const existing = await User.findOne({ username: 'admin' });
    if (existing) {
        console.log('Admin user already exists!');
        process.exit(0);
    }

    await User.create({
        username: 'admin',
        password: 'admin1234',
        displayName: 'ผู้ดูแลระบบ',
        role: 'admin',
    });

    console.log('✅ Admin user created! username: admin / password: admin1234');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
