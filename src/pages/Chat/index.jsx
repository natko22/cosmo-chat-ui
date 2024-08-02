import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Box, TextField, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import ChatHistory from "../../components/ChatHistory/index";
import { useNavigate } from "react-router-dom";
import ChatIcon from "@mui/icons-material/Chat";
import DashboardIcon from "@mui/icons-material/Dashboard";

const socket = io("http://localhost:3001");

const Chat = () => {
  const { sessionId } = useParams();
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedSessions = JSON.parse(localStorage.getItem("sessions")) || [];
    const session = storedSessions.find(
      (session) => session.date === sessionId
    );
    if (session) {
      setChatMessages(session.chats);
    } else {
      const globalChatMessages =
        JSON.parse(localStorage.getItem("chatMessages")) || [];
      setChatMessages(globalChatMessages);
    }
  }, [sessionId]);

  useEffect(() => {
    socket.on("message", (message) => {
      console.log("New message received:", message);
      setChatMessages((prevMessages) => {
        const newMessages = [...prevMessages, message];
        localStorage.setItem("chatMessages", JSON.stringify(newMessages));
        return newMessages;
      });
    });

    return () => {
      socket.off("message");
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

  const endSession = () => {
    const currentSession = {
      date: new Date().toISOString(),
      chats: chatMessages,
    };

    const storedSessions = JSON.parse(localStorage.getItem("sessions")) || [];
    storedSessions.push(currentSession);
    localStorage.setItem("sessions", JSON.stringify(storedSessions));

    setChatMessages([]);
    localStorage.removeItem("chatMessages");
  };

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
          style={{
            marginRight: "10px",
            color: "white",
            backgroundColor: "#32063b",
          }}
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
          onKeyPress={(e) => (e.key === "Enter" ? sendMessage() : null)}
          InputProps={{ style: { color: "white" } }}
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={sendMessage}
          sx={{ mr: 1 }}
        >
          Send
        </Button>
        <Button variant="contained" color="error" onClick={endSession}>
          End
        </Button>
      </Box>
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default Chat;
