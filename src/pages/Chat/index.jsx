import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Box, TextField, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import ChatHistory from "../../components/ChatHistory/index";
import { useNavigate } from "react-router-dom";
import ChatIcon from "@mui/icons-material/Chat";
import DashboardIcon from "@mui/icons-material/Dashboard";

// Initialize Socket.IO client connection
const socket = io("http://localhost:3001");

const Chat = () => {
  const { sessionId } = useParams(); // Retrieve sessionId from URL parameters
  const [chatMessages, setChatMessages] = useState([]); // State to hold chat messages
  const [input, setInput] = useState(""); // State to hold input message
  const messagesEndRef = useRef(null); // Ref to handle auto-scrolling
  const navigate = useNavigate(); // Hook to programmatically navigate

  // Load chat messages from local storage based on sessionId
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

  // Set up Socket.IO event listeners
  useEffect(() => {
    socket.on("message", (message) => {
      console.log("New message received:", message);
      setChatMessages((prevMessages) => {
        const newMessages = [...prevMessages, message];
        localStorage.setItem("chatMessages", JSON.stringify(newMessages)); // Save new messages to local storage
        return newMessages;
      });
    });

    // Clean up event listener on component unmount
    return () => {
      socket.off("message");
    };
  }, []);

  // Function to send a new message
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

  // Function to end the current chat session
  const endSession = () => {
    const currentSession = {
      date: new Date().toISOString(),
      chats: chatMessages,
    };

    const storedSessions = JSON.parse(localStorage.getItem("sessions")) || [];
    storedSessions.push(currentSession); // Add current session to stored sessions
    localStorage.setItem("sessions", JSON.stringify(storedSessions));

    setChatMessages([]); // Clear chat messages
    localStorage.removeItem("chatMessages"); // Remove chat messages from local storage
  };

  // Scroll to the latest message whenever chatMessages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <Box display="flex" flexDirection="column" height="100vh" bgcolor="#000000">
      <Box display="flex" justifyContent="right" mt={2}>
        <Button
          variant="contained"
          onClick={() => navigate("/activity")} // Navigate to activity page
          style={{ marginRight: "10px" }}
          color="secondary"
        >
          <ChatIcon />
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate("/dashboard")} // Navigate to dashboard page
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
      <Box flexGrow={1} overflow="auto" p={2} bgcolor="#000000">
        <ChatHistory
          chatMessages={chatMessages} // Pass chat messages to ChatHistory component
          messagesEndRef={messagesEndRef} // Pass ref to ChatHistory component for auto-scrolling
        />
      </Box>
      <Box
        display="flex"
        p={2}
        bgcolor="#1b1a1c"
        sx={{
          "& .MuiButton-root": {
            transition: "background-color 0.3s, transform 0.3s",
            "&:hover": {
              transform: "scale(1.05)",
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          },
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)} // Update input state on change
          placeholder="Type a message..."
          onKeyPress={(e) => (e.key === "Enter" ? sendMessage() : null)} // Send message on Enter key press
          InputProps={{ style: { color: "white" } }}
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={sendMessage} // Send message on click
          sx={{
            mr: 1,
            backgroundColor: "#6a1b9a", // Default color
            "&:hover": {
              backgroundColor: "#8e24aa", // Hover color
              transform: "scale(1.05)",
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          }}
        >
          Send
        </Button>
        <Button
          variant="contained"
          onClick={endSession}
          sx={{
            backgroundColor: "#32063b", // Default color
            "&:hover": {
              backgroundColor: "#452a59", // Hover color
              transform: "scale(1.05)",
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          }}
        >
          End
        </Button>
      </Box>
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default Chat;
