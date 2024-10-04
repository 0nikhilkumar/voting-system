const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected !! DB HOST: ${connection.connection.host}`);
    } catch (error) {
        console.log("Database is not connected");
        process.exit(1);
    }
}

module.exports = connectDB;
