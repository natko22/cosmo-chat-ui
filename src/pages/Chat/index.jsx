import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Box, TextField, Button } from "@mui/material";
import ChatHistory from "../../components/ChatHistory/index";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import ChatIcon from "@mui/icons-material/Chat";
import DashboardIcon from "@mui/icons-material/Dashboard";

const socket = io("http://localhost:3001");

const Chat = () => {
  const [chatMessages, setChatMessages] = useState(() => {
    const savedMessages = localStorage.getItem("messages"); // Changed from "chatMessages" to "messages"
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("loadMessages", (messages) => {
      console.log("Loaded Messages: ", messages);
      setChatMessages(messages);
      localStorage.setItem("messages", JSON.stringify(messages)); // Changed from "chatMessages" to "messages"
    });

    socket.on("message", (message) => {
      console.log("New message received:", message);
      setChatMessages((prevMessages) => {
        const newMessages = [...prevMessages, message];
        localStorage.setItem("messages", JSON.stringify(newMessages)); // Changed from "chatMessages" to "messages"
        return newMessages;
      });
    });

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
      socket.emit("message", message);
      setInput("");
    }
  };

  const debouncedSendMessage = _.debounce(sendMessage, 1000);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Box display="flex" justifyContent="right" mt={2}>
        <Button
          variant="contained"
          onClick={() => navigate("/activity")}
          style={{ marginRight: "10px" }}
          color="secondary"
        >
          <ChatIcon />
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate("/dashboard")}
          color="info"
          style={{ marginRight: "10px" }}
        >
          <DashboardIcon />
        </Button>
      </Box>
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
          InputProps={{ style: { color: "white" } }}
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
