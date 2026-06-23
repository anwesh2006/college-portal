const mongoose = require('mongoose');
require('dotenv').config();

const showDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college_portal');
        console.log('\n=== MONGODB DATABASE INFO ===');
        console.log('Database: college_portal\n');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`Found ${collections.length} collections:`);
        
        for (let col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`  - ${col.name} (${count} documents)`);
        }
        
        console.log('\n=============================');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

showDB();
