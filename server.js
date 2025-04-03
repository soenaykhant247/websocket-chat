const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const cors = require("cors");

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Connect to MongoDB
mongoose.connect("mongodb+srv://root:<db_password>@testingwebsocket.6omjh71.mongodb.net/?retryWrites=true&w=majority&appName=TestingWebSocket", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define Chat Schema
const ChatMessage = mongoose.model("ChatMessage", new mongoose.Schema({
    sender: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
}));

// Middleware
app.use(cors());
app.use(express.json());

// Fetch chat history API
app.get("/messages", async (req, res) => {
    const messages = await ChatMessage.find().sort({ timestamp: 1 });
    res.json(messages);
});

// WebSocket Logic
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendMessage", async (data) => {
        const chatMessage = new ChatMessage({ sender: data.sender, message: data.message });
        await chatMessage.save();
        io.emit("receiveMessage", chatMessage);
    });

    socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

// Start Server
server.listen(5001, () => console.log("Server running on port 5000"));
