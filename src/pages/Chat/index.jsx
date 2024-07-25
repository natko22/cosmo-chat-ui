import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

const socket = io("http://localhost:3001");

const Chat = () => {
  const [chatMessages, setChatMessages] = useState([]); // State to store chat messages
  const [input, setInput] = useState(""); // State to store input value
  const messagesEndRef = useRef(null); // Ref to keep track of the end of the messages list

  useEffect(() => {
    // Listen for incoming messages and update the chatMessages state
    socket.on("message", (message) => {
      setChatMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      const message = { text: input, sender: "me" };
      socket.emit("message", message); // Emit the message to the server
      setInput(""); // Clear the input field
    }
  };

  useEffect(() => {
    // Scroll to the bottom of the messages list whenever chatMessages state changes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Box flex={1} overflow="auto" p={2}>
        {/* Render the chat messages */}
        {chatMessages.map((message, index) => (
          <Paper
            key={index}
            style={{
              margin: "10px 0",
              padding: "10px 20px",
              alignSelf: message.sender === "me" ? "flex-end" : "flex-start",
              backgroundColor:
                message.sender === "me" ? "#72397a9c" : "#a62374b6",
            }}
          >
            <Typography variant="body1">
              {message.sender}: {message.text}
            </Typography>
          </Paper>
        ))}
        <div ref={messagesEndRef} />{" "}
        {/* Empty div to maintain scroll position */}
      </Box>
      <Box display="flex" p={2} bgcolor="#242122">
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => (e.key === "Enter" ? sendMessage() : null)}
          InputProps={{
            style: { color: "white" },
          }}
          sx={{ mr: 1 }}
        />
        <Button variant="contained" color="secondary" onClick={sendMessage}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;
