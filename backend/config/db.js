const mongoose = require('mongoose');


const MONGO_URI = process.env.NODE_ENV === "test"
  ? process.env.TEST_MONGO_URI
  : process.env.MONGODB_URI;

const connectDB = async () => {
    if (!MONGO_URI) {
        console.error('MONGO_URI is not defined in environment variables');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

mongoose.connection.on('error', err => {
    console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during MongoDB disconnect:', err);
        process.exit(1);
    }
});

module.exports = connectDB;
