import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
    const uri = process.env.mongo_url || process.env.MONGO_URI;
    if (!uri) {
        console.error("Error: MongoDB connection string (mongo_url) is not defined in .env");
        return;
    }
    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`); 
    } catch (error) {
        isConnected = false;
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
    }
};

export const getDbStatus = () => mongoose.connection.readyState === 1;

export default connectDB;
