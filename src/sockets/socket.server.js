const {Server} = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user.model");
const main = require('../services/ai.service')

function initSocket(httpserver) {
    const io = new Server(httpserver, {});

    io.use(async (socket, next) => {
        try {
            const rawCookies = socket.handshake.headers?.cookie || "";
            const cookies = cookie.parse(rawCookies);

            console.log(cookies);

            if (!cookies.token) {
                next(new Error("Authentication Error : No token provided"))
            }

            try {
                const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)
                const user = await userModel.findById(decoded.id).select('-password')
                socket.user = user
                next()
            } catch (err) {
                next(new Error("Authentication Failed"))

            }

            next();
        } catch (err) {
            next(err);
        }
    });

    io.on("connection", (socket) => {
        socket.on("ai-message", async (data) => {
            const response = await main(data)
            console.log(response);

            socket.emit("ai-response", response)
        })
    });

}

module.exports = initSocket;