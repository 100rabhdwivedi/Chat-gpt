const mongoose = require("mongoose")

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected to db");
        
    } catch (error) {
        console.log("Connection failed :",error)
    }
}

module.exports = connectDB