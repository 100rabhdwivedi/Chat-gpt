require("dotenv").config()
const app = require("./src/app");
const connectDB = require('./src/db/db')


app.listen(process.env.PORT||3000,(req,res)=>{
    console.log(`Server running on port ${process.env.PORT||3000}`)
    connectDB()
})
