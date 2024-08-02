const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust this if your frontend runs on a different port
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

// Rate limiting queue to manage OpenAI API requests
const rateLimitQueue = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || rateLimitQueue.length === 0) return;
  isProcessingQueue = true;

  const { socket, message } = rateLimitQueue.shift();
  try {
    const aiResponse = await getAIResponse(message.text);
    const aiMessage = {
      text: aiResponse,
      sender: "AI",
      timestamp: new Date().toISOString(),
    };
    messages.push(aiMessage);
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2)); // Save AI messages to file
    io.emit("message", aiMessage); // Broadcast AI message to all clients
  } catch (error) {
    const fallbackMessage = {
      text: "Sorry, the AI is currently unavailable due to rate limits. Please try again later.",
      sender: "AI",
      timestamp: new Date().toISOString(),
    };
    messages.push(fallbackMessage);
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2)); // Save fallback messages to file
    io.emit("message", fallbackMessage); // Broadcast fallback message to all clients
  } finally {
    isProcessingQueue = false;
    if (rateLimitQueue.length > 0) {
      setTimeout(processQueue, 2000); // Delay before processing the next request
    }
  }
};

// Handle new socket connections
io.on("connection", (socket) => {
  // Send existing messages to the connected client
  socket.emit("loadMessages", messages);

  // Handle incoming messages
  socket.on("message", (message) => {
    messages.push(message);
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2)); // Save messages to file
    io.emit("message", message); // Broadcast message to all clients

    // Add message to the rate limit queue for processing
    rateLimitQueue.push({ socket, message });
    processQueue();
  });

  // Handle client disconnect
  socket.on("disconnect", () => {});
});

// Start the server
server.listen(3001, () => {
  console.log("Server is running on port 3001");
});

// Function to make a request to OpenAI's API
const makeOpenAIRequest = async (userMessage) => {
  const maxRetries = 5;
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "Explain things like you're talking to a software professional with 2 years of experience.",
            },
            { role: "user", content: userMessage },
          ],
          max_tokens: 150,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Handle rate limit errors with exponential backoff
        const delay = Math.pow(2, currentRetry) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        currentRetry++;
      } else {
        throw error;
      }
    }
  }

  throw new Error("Exceeded maximum retries");
};

// Function to get AI response using OpenAI's API
const getAIResponse = async (userMessage) => {
  try {
    return await makeOpenAIRequest(userMessage);
  } catch (error) {
    throw error;
  }
};
