import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Box, TextField, Button } from "@mui/material";
import ChatHistory from "../../components/ChatHistory/index";
import _ from "lodash";

const socket = io("http://localhost:3001");

const Chat = () => {
  const [chatMessages, setChatMessages] = useState(() => {
    // Retrieve messages from localStorage on initial load
    const savedMessages = localStorage.getItem("chatMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load existing messages from server
    socket.on("loadMessages", (messages) => {
      setChatMessages(messages);
      localStorage.setItem("chatMessages", JSON.stringify(messages)); // Save messages to localStorage
    });

    // Listen for incoming messages
    socket.on("message", (message) => {
      console.log("New message received:", message); // Log all received messages
      setChatMessages((prevMessages) => {
        const newMessages = [...prevMessages, message];
        localStorage.setItem("chatMessages", JSON.stringify(newMessages)); // Save messages to localStorage
        return newMessages;
      });
    });

    // Cleanup function to remove listeners when the component unmounts
    return () => {
      socket.off("message");
      socket.off("loadMessages");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      const message = {
        text: input,
        sender: "me",
        timestamp: new Date().toISOString(),
      };
      socket.emit("message", message); // Emit the message to the server
      setInput(""); // Clear the input field
    }
  };

  // Debounce the sendMessage function to limit the rate of sending messages
  const debouncedSendMessage = _.debounce(sendMessage, 1000);

  useEffect(() => {
    // Scroll to the bottom of the messages list whenever chatMessages state changes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <ChatHistory
        chatMessages={chatMessages}
        messagesEndRef={messagesEndRef}
      />
      <Box display="flex" p={2} bgcolor="#242122">
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) =>
            e.key === "Enter" ? debouncedSendMessage() : null
          }
          InputProps={{
            style: { color: "white" },
          }}
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={debouncedSendMessage}
        >
          Send
        </Button>
      </Box>
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default Chat;
