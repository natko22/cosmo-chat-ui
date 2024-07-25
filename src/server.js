const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const messagesFilePath = path.join(__dirname, "messages.json");

// Load messages from file
let messages = [];
if (fs.existsSync(messagesFilePath)) {
  const data = fs.readFileSync(messagesFilePath, "utf8");
  messages = JSON.parse(data);
}

io.on("connection", (socket) => {
  console.log("New client connected");

  // Send existing messages to the client
  socket.emit("loadMessages", messages);

  socket.on("message", (message) => {
    messages.push(message);
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2)); // Save messages to file
    io.emit("message", message); // Broadcast message to all clients
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
