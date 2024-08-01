const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const axios = require("axios");

// Load environment variables from .env file
dotenv.config();

console.log("OpenAI API Key:", process.env.OPENAI_API_KEY); // Log the API key

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
  console.log("Loaded messages from file:", messages);
} else {
  console.log("No existing messages file found. Starting fresh.");
}

const rateLimitQueue = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || rateLimitQueue.length === 0) return;
  isProcessingQueue = true;

  const { socket, message } = rateLimitQueue.shift();
  try {
    const aiResponse = await getAIResponse(message.text);
    console.log("AI Response from OpenAI:", aiResponse); // Log the AI response
    const aiMessage = {
      text: aiResponse,
      sender: "AI",
      timestamp: new Date().toISOString(),
    };
    messages.push(aiMessage);
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2)); // Save AI messages to file
    io.emit("message", aiMessage); // Broadcast AI message to all clients
    console.log("Broadcasted AI Message:", aiMessage); // Log the broadcast
  } catch (error) {
    console.error("Error processing AI response:", error.message);
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

io.on("connection", (socket) => {
  console.log("New client connected");

  // Send existing messages to the client
  socket.emit("loadMessages", messages);
  console.log("Sent existing messages to the client");

  socket.on("message", (message) => {
    console.log("Received message from client:", message);
    messages.push(message);
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2)); // Save messages to file
    console.log("Saved message to file:", message);
    io.emit("message", message); // Broadcast message to all clients
    console.log("Broadcasted message to all clients:", message);

    rateLimitQueue.push({ socket, message });
    processQueue();
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});

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
      console.log("OpenAI API Response Data:", response.data);
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const delay = Math.pow(2, currentRetry) * 1000;
        console.error(
          `Rate limit exceeded. Retrying after ${delay / 1000} seconds.`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        currentRetry++;
      } else {
        console.error("Error during OpenAI API request:", error.message);
        throw error;
      }
    }
  }

  throw new Error("Exceeded maximum retries");
};

const getAIResponse = async (userMessage) => {
  try {
    return await makeOpenAIRequest(userMessage);
  } catch (error) {
    console.error("Error getting AI response:", error.message);
    throw error;
  }
};
