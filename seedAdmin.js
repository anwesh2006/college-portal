/**
 * Seed the default admin account.
 * Run: node seedAdmin.js
 * 
 * This creates the single admin user. Admin cannot be created
 * through the signup page — only through this script.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_EMAIL = 'admin@eduportal.com';
const ADMIN_PASSWORD = 'Admin@2026';
const ADMIN_NAME = 'Portal Administrator';

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            console.log('⏭ Admin user already exists:');
            console.log(`   Email: ${ADMIN_EMAIL}`);
            console.log(`   Role: ${existing.role}`);
            process.exit(0);
        }

        const admin = new User({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,  // Will be hashed by pre('save') hook
            role: 'admin'
        });
        // plainPassword is set automatically by the pre-save hook

        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('─────────────────────────────────');
        console.log(`   Email:    ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log('─────────────────────────────────');
        console.log('⚠️  Change the password after first login!');

        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}

seedAdmin();
