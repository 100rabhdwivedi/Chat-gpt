require("dotenv").config()
const app = require("./src/app");
const connectDB = require('./src/db/db')
const http = require('http')
const initSocket = require("./src/sockets/socket.server")
const httpServer = http.createServer(app)


initSocket(httpServer)

httpServer.listen(process.env.PORT || 3000, (req, res) => {
    console.log(`Server running on port ${process.env.PORT||3000}`)
    connectDB()
})