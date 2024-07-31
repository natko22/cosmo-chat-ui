import React from "react";
import { Box, Typography } from "@mui/material";

const ChatHistory = ({ chatMessages, messagesEndRef }) => {
  return (
    <Box flex="1" overflow="auto" p={2} bgcolor="#f5f5f5">
      {chatMessages.map((message, index) => (
        <Box
          key={index}
          mb={2}
          p={2}
          borderRadius="5px"
          bgcolor={message.sender === "me" ? "#8e44ad" : "#3498db"}
        >
          <Typography variant="body1" color="white">
            {message.sender}: {message.text}
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            {new Date(message.timestamp).toLocaleString()}
          </Typography>
        </Box>
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default ChatHistory;
