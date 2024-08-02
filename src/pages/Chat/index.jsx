// src/pages/Chat/index.jsx
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Box, TextField, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ChatHistory from "../../components/ChatHistory/index";
import ChatIcon from "@mui/icons-material/Chat";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {
  saveMessage,
  fetchMessages,
  endChatSession,
  auth,
} from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const socket = io("http://localhost:3001");

const Chat = () => {
  const { sessionId } = useParams();
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    console.log("User object:", user); // Debug log
    if (user) {
      console.log("User ID:", user.uid); // Debug log
      console.log("User email:", user.email); // Debug log
    } else if (!loading) {
      console.log("User is not authenticated"); // Debug log
    }
    console.log("Session ID from route params:", sessionId); // Debug log
  }, [user, sessionId, loading]);

  const uniqueSessionId = user && sessionId ? `${user.uid}-${sessionId}` : null;
  console.log(`Unique Session ID: ${uniqueSessionId}`); // Debug log

  useEffect(() => {
    if (uniqueSessionId) {
      console.log(`Fetching messages for session: ${uniqueSessionId}`);
      fetchMessages(uniqueSessionId, setChatMessages);
    }
  }, [uniqueSessionId]);

  useEffect(() => {
    const handleMessage = (message) => {
      console.log("New message received via socket:", message);
      setChatMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, []);

  const sendMessage = async () => {
    console.log("sendMessage function called"); // Debug log
    if (input.trim() && uniqueSessionId) {
      const message = {
        text: input,
        sender: user.email,
        timestamp: new Date().toISOString(),
      };
      try {
        console.log("Sending message:", message); // Debug log
        await saveMessage(uniqueSessionId, message);
        console.log("Message saved to Firebase"); // Debug log
        socket.emit("message", message);
        console.log("Message emitted via socket"); // Debug log
        setInput(""); // Clear input after sending
        setChatMessages((prevMessages) => [...prevMessages, message]); // Update chat messages
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.log("Message input is empty or uniqueSessionId is null"); // Debug log
      console.log(`Input: ${input}`); // Debug log
      console.log(`uniqueSessionId: ${uniqueSessionId}`); // Debug log
    }
  };

  const endSession = async () => {
    if (uniqueSessionId) {
      const currentSession = {
        date: new Date().toISOString(),
        chats: chatMessages,
      };

      try {
        console.log("Ending session:", currentSession);
        await endChatSession(uniqueSessionId, chatMessages);
        const storedSessions =
          JSON.parse(localStorage.getItem(`${user.uid}-sessions`)) || [];
        storedSessions.push(currentSession);
        localStorage.setItem(
          `${user.uid}-sessions`,
          JSON.stringify(storedSessions)
        );
        setChatMessages([]);
        localStorage.removeItem("chatMessages");
        console.log("Session ended successfully");
      } catch (error) {
        console.error("Error ending session:", error);
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

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
