// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import toast from "react-hot-toast";

const SOCKET_URL = "http://localhost:8000";
const API_BASE = "http://localhost:8000/api/chat"; // your POST route is router.post('/', authUser, createChat)

const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
});

const Home = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [history, setHistory] = useState([]); // created chats only (no GET endpoint available)
    const [currentChat, setCurrentChat] = useState(null); // { id, title }
    const [messages, setMessages] = useState([]); // current chat messages
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Socket: listen for ai-response
    useEffect(() => {
        socket.on("connect", () => {
            console.log("socket connected", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("socket connect error", err);
            toast.error("Socket connect error. Check backend & CORS.");
        });

        socket.on("ai-response", (data) => {
            // Received AI result (string)
            setIsTyping(false);
            setMessages((prev) => [...prev, { role: "model", content: data }]);
        });

        socket.on("message-error", (err) => {
            setIsTyping(false);
            toast.error("Message error: " + (err?.message || err));
        });

        socket.on("chatHistory-error", (err) => {
            toast.error("Chat history error: " + (err?.message || err));
        });

        return () => {
            socket.off("ai-response");
            socket.off("message-error");
            socket.off("chatHistory-error");
            socket.off("connect_error");
        };
    }, []);

    // Helper: create chat on backend
    async function createChatOnServer(title = `Chat ${history.length + 1}`) {
        try {
            const res = await axios.post(
                API_BASE,
                { title },
                { withCredentials: true }
            );
            if (res?.status === 201 && res?.data?.chat) {
                const chat = res.data.chat;
                // keep shape consistent
                const chatObj = { id: chat._id || chat.id, title: chat.title || title };
                setHistory((prev) => [chatObj, ...prev]);
                setCurrentChat(chatObj.id);
                // clear messages for new chat
                setMessages([]);
                return chatObj;
            } else {
                toast.error("Unable to create chat");
                return null;
            }
        } catch (err) {
            console.error("createChat error", err);
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to create chat on server";
            toast.error(msg);
            return null;
        }
    }

    // Called when user clicks New Chat
    const handleNewChat = async () => {
        setSidebarOpen(false);
        await createChatOnServer();
    };

    // If there's no current chat when sending, create one automatically
    const ensureChatThenSend = async (text) => {
        if (!currentChat) {
            const chat = await createChatOnServer("Quick Chat");
            if (!chat) return; // failed to create chat
            setCurrentChat(chat.id);
            // small delay to allow UI update
        }
        sendMessage(text);
    };

    // Send message flow
    const sendMessage = (text) => {
        if (!text || !text.trim()) return;
        if (!currentChat) {
            // safety -- should be handled by ensureChatThenSend
            toast.error("No chat selected / created");
            return;
        }

        // push user message to UI instantly
        setMessages((prev) => [...prev, { role: "user", content: text }]);
        setInput("");
        setIsTyping(true);

        // emit to backend exactly as backend expects
        socket.emit("ai-message", {
            content: text,
            chat: currentChat,
        });
    };

    // quick send on enter
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!input.trim()) return;
            // if no chat exists, create then send
            if (!currentChat) {
                ensureChatThenSend(input);
            } else {
                sendMessage(input);
            }
        }
    };

    // Switch chat (local)
    const selectChat = (chat) => {
        setCurrentChat(chat.id);
        setMessages([]); // no history retrieval available (no GET route). You can improve later by adding a GET endpoint.
    };

    return (
        <div className="flex h-screen bg-[#0b0b0b] text-white">
            {/* Sidebar */}
            <div
                className={`fixed md:static top-0 left-0 w-72 h-full bg-[#0f1724] border-r border-gray-800 transition-transform z-40
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                <div className="p-4 flex items-center justify-between border-b border-gray-700">
                    <h3 className="font-semibold text-lg">Chats</h3>
                    <button
                        className="md:hidden text-xl"
                        onClick={() => setSidebarOpen(false)}
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4">
                    <button
                        onClick={handleNewChat}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md"
                    >
                        + New Chat
                    </button>

                    <div className="mt-4 space-y-2 max-h-[65vh] overflow-auto pr-2">
                        {history.length === 0 ? (
                            <div className="text-gray-400 text-sm">No chats yet. Create one.</div>
                        ) : (
                            history.map((c) => (
                                <div
                                    key={c.id}
                                    onClick={() => {
                                        selectChat(c);
                                        setSidebarOpen(false);
                                    }}
                                    className={`p-3 rounded-md cursor-pointer ${currentChat === c.id ? "bg-gray-700" : "bg-[#0b1220]"
                                        } hover:bg-gray-700`}
                                >
                                    {c.title}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu button */}
            <button
                className="md:hidden text-3xl absolute top-4 left-4 z-50"
                onClick={() => setSidebarOpen(true)}
            >
                ☰
            </button>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
                {/* header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <div>
                        <h2 className="text-xl font-semibold">
                            {currentChat ? `Chat: ${currentChat}` : "No Chat Selected"}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {currentChat ? "Start chatting — AI will reply here" : "Create a chat to begin"}
                        </p>
                    </div>
                </div>

                {/* messages */}
                <div className="flex-1 overflow-auto p-6 space-y-4">
                    {messages.length === 0 && !isTyping && (
                        <div className="text-gray-400 text-center mt-16">
                            {currentChat ? "Send a message to start the conversation." : "Create a new chat or send a message."}
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`max-w-[75%] px-4 py-3 rounded-2xl break-words ${m.role === "user"
                                    ? "bg-blue-600 self-end ml-auto text-white"
                                    : "bg-[#0b1220] border border-gray-800 self-start"
                                }`}
                        >
                            {m.content}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="max-w-[60%] px-4 py-3 rounded-2xl bg-[#0b1220] border border-dashed border-gray-600 self-start animate-pulse">
                            AI is typing...
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* input */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex gap-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message and press Enter to send"
                            className="flex-1 min-h-[48px] max-h-36 resize-none p-3 rounded-md bg-[#071024] border border-gray-800 outline-none"
                        />

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    if (!input.trim()) return;
                                    if (!currentChat) {
                                        ensureChatThenSend(input);
                                    } else {
                                        sendMessage(input);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md"
                            >
                                Send
                            </button>

                            <button
                                onClick={async () => {
                                    // quick create chat
                                    const c = await createChatOnServer(`Chat ${history.length + 1}`);
                                    if (c) toast.success("Chat created");
                                }}
                                className="px-4 py-2 bg-gray-700 rounded-md text-sm"
                            >
                                Create Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
