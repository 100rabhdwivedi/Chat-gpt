import React, { useState } from "react";
import { AiOutlinePlus, AiOutlineSend, AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

const Home = () => {
    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hello! How can I assist you today? 😊" }
    ]);

    const [chatInput, setChatInput] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const history = [
        "Login Page Project",
        "JavaScript Doubts",
        "React Hooks Notes",
        "Tailwind UI Practice"
    ];

    const sendMessage = () => {
        if (!chatInput.trim()) return;

        setMessages([...messages, { sender: "user", text: chatInput }]);
        setChatInput("");
    };

    return (
        <div className="h-screen bg-[#0e0e0e] text-white flex">

            {/* MOBILE TOP BAR (Hamburger Menu) */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-[#111] border-b border-gray-800 p-4 flex justify-between items-center z-40">
                <button onClick={() => setSidebarOpen(true)}>
                    <AiOutlineMenu className="text-2xl text-gray-300" />
                </button>

                <h1 className="text-lg font-semibold text-gray-200">Chat</h1>

                <div className="w-6"></div>
            </div>

            {/* SIDEBAR */}
            <div
                className={`
          fixed md:static top-0 left-0 h-full w-[260px] bg-[#141414] border-r border-gray-800 p-4 z-50
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
            >
                {/* SIDEBAR HEADER WITH CLOSE BUTTON */}
                <div className="flex justify-between items-center mb-4 md:hidden">
                    <h2 className="text-gray-300 font-medium">Menu</h2>

                    {/* CLOSE BUTTON */}
                    <button onClick={() => setSidebarOpen(false)}>
                        <AiOutlineClose className="text-2xl text-gray-300" />
                    </button>
                </div>

                {/* New Chat Button */}
                <button
                    className="bg-gray-800 hover:bg-gray-700 transition p-3 rounded-lg flex items-center gap-2 text-left w-full"
                >
                    <AiOutlinePlus className="text-xl" />
                    <span className="text-sm font-medium">New Chat</span>
                </button>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto mt-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <h3 className="text-gray-400 text-sm mb-2">Your Chats</h3>

                    {history.map((item, index) => (
                        <div
                            key={index}
                            className="p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] cursor-pointer mb-2 transition"
                        >
                            <p className="text-gray-300 text-sm">{item}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* OVERLAY FOR MOBILE */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden z-40"
                ></div>
            )}

            {/* CENTER CHAT AREA */}
            <div className="flex-1 flex flex-col pt-14 md:pt-0">

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-10 space-y-6">

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`max-w-xl p-4 rounded-xl ${msg.sender === "user"
                                    ? "bg-blue-600/20 self-end border border-blue-600/30"
                                    : "bg-white/10 border border-white/10"
                                }`}
                        >
                            {msg.text}
                        </div>
                    ))}

                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-800 p-4 bg-[#111]">
                    <div className="flex items-center bg-[#1a1a1a] p-3 rounded-full border border-gray-700">
                        <input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            type="text"
                            placeholder="Ask anything..."
                            className="flex-1 bg-transparent outline-none text-gray-200 px-3"
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-blue-600 hover:bg-blue-500 transition p-2 rounded-full"
                        >
                            <AiOutlineSend className="text-xl" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Home;
