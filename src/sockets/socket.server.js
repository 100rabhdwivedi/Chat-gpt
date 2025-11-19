const {Server} = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user.model");
const main = require('../services/ai.service')
const {createMessage} = require('../handlers/message.handler')
const {fetchHistory} = require('../handlers/message.handler')

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
            const payLoad = {
                content:data.content,
                chat:data.chat,
                user:socket.user._id,
                role : 'user'
            }
            const userMessage = await createMessage(payLoad)
            if(userMessage.error){
                return  socket.emit("message-error", userMessage.error)
            }

            const chatHistory = await fetchHistory(payLoad.chat)

            if(chatHistory.error){
                return  socket.emit("chatHistory-error", chatHistory.error)

            }

            const response = await main(chatHistory)
            payLoad.role = 'assistant'
            payLoad.content = response

            const aiMessage = await createMessage(payLoad)

            socket.emit("ai-response", aiMessage.content)

            if(aiMessage.error){
                return socket.emit("message-error", aiMessage.error)
            }
        })
    });

}

module.exports = initSocket;