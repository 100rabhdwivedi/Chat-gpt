const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user.model");
const { main, generateVector } = require("../services/ai.service");
const { createMessage, fetchHistory } = require("../handlers/message.handler");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocket(httpserver) {
    const io = new Server(httpserver, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Auth middleware
    io.use(async (socket, next) => {
        try {
            const rawCookies = socket.handshake.headers?.cookie || "";
            const cookies = cookie.parse(rawCookies);

            if (!cookies.token) {
                return next(new Error("Authentication Error: No token provided"));
            }

            try {
                const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
                const user = await userModel.findById(decoded.id).select("-password");

                if (!user) return next(new Error("User not found"));

                socket.user = user;
                return next();
            } catch (err) {
                return next(new Error("Authentication Failed"));
            }

        } catch (err) {
            next(err);
        }
    });

    // Connection
    io.on("connection", (socket) => {
        console.log("🔥 User connected:", socket.user.email);

        socket.on("ai-message", async (data) => {
            try {
                const payLoad = {
                    content: data.content,
                    chat: data.chat,
                    user: socket.user._id,
                    role: "user",
                };

                const [userMessage, vectors] = await Promise.all([
                    createMessage(payLoad),
                    generateVector(data.content),
                ]);

                if (userMessage.error) {
                    return socket.emit("message-error", userMessage.error);
                }

                const [memory, saved, chatHistory] = await Promise.all([
                    queryMemory({
                        queryVector: vectors,
                        limit: 3,
                        metadata: { user: socket.user._id },
                    }),
                    createMemory({
                        vectors,
                        messageId: userMessage._id,
                        metadata: {
                            chat: data.chat,
                            user: socket.user._id,
                            text: data.content,
                        },
                    }),
                    fetchHistory(payLoad.chat),
                ]);

                if (chatHistory.error) {
                    return socket.emit("chatHistory-error", chatHistory.error);
                }

                const stm = chatHistory;
                const ltm = [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `These are some previous messages:\n${memory
                                    .map((item) => item.metadata.text)
                                    .join("\n")}`,
                            },
                        ],
                    },
                ];

                const response = await main([...ltm, ...stm]);

                payLoad.role = "model";
                payLoad.content = response;

                const [aiMessage, resVector] = await Promise.all([
                    createMessage(payLoad),
                    generateVector(response),
                ]);

                await createMemory({
                    vectors: resVector,
                    messageId: aiMessage._id,
                    metadata: {
                        chat: data.chat,
                        user: socket.user._id,
                        text: response,
                    },
                });

                socket.emit("ai-response", aiMessage.content);
            } catch (err) {
                console.log("AI ERROR:", err);
                socket.emit("ai-response", "AI Error: " + err.message);
            }
        });
    });

    return io;
}

module.exports = initSocket;
