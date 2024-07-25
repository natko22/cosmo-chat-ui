import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const ChatHistory = ({ chatMessages }) => {
  return (
    <Box flex={1} overflow="auto" p={2}>
      {chatMessages.map((message, index) => (
        <Paper
          key={index}
          style={{
            margin: "10px 0",
            padding: "10px 20px",
            alignSelf: message.sender === "me" ? "flex-end" : "flex-start",
            backgroundColor: message.sender === "me" ? "#72397a9c" : "#e0e0e0",
          }}
        >
          <Typography variant="body1">
            {message.sender}: {message.text}
          </Typography>
          <Typography
            variant="caption"
            style={{ fontSize: "0.8em", color: "#aaa" }}
          >
            {new Date(message.timestamp).toLocaleString()}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default ChatHistory;
