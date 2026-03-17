const mongoose = require("mongoose");
const { MONGO_URI } = require("./serverConfig");

async function connectdb() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Mongo DB connected successfully");
    } catch (error) {
        console.error("Error connnecting DB : ",error);
        process.exit(1);
    }
}

module.exports = connectdb;