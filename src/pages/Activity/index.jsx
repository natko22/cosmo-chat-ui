import React, { useState, useEffect, useRef } from "react";
import { Grid, CircularProgress, Typography, Box, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import ArrowBack icon
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChatHistory from "../../components/ChatHistory";
import { useNavigate } from "react-router-dom";

const transformMessagesToSessions = (messages) => {
  const sessions = [];
  let currentSession = { date: "", chats: [] };

  messages.forEach((message) => {
    const messageTimestamp = new Date(message.timestamp).toISOString();

    if (currentSession.date !== messageTimestamp) {
      if (currentSession.date) {
        sessions.push(currentSession);
      }
      currentSession = { date: messageTimestamp, chats: [message] };
    } else {
      currentSession.chats.push(message);
    }
  });

  if (currentSession.date) {
    sessions.push(currentSession);
  }

  console.log("Transformed Sessions: ", sessions);
  return sessions;
};

const Activity = () => {
  const [loading, setLoading] = useState(true);
  const [sessionDates, setSessionDates] = useState([]);
  const [sessionChatLengths, setSessionChatLengths] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(null);
  const [viewAll, setViewAll] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const sessionDetailsRef = useRef(null);

  useEffect(() => {
    const fetchSessions = () => {
      const storedSessions = JSON.parse(localStorage.getItem("sessions")) || [];
      console.log("Stored Sessions: ", storedSessions);
      setSessions(storedSessions.reverse());
      setSessionDates(storedSessions.map((data) => data.date));
      setSessionChatLengths(storedSessions.map((data) => data.chats.length));
      setLoading(false);
    };
    fetchSessions();
  }, []);

  const data = sessionDates.map((date, index) => ({
    date,
    length: sessionChatLengths[index],
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#fff",
            padding: "5px",
            border: "1px solid #ccc",
          }}
        >
          <p className="label">{`Date: ${label}`}</p>
          <p className="intro">{`Messages: ${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
  };

  const handleSessionClick = (index) => {
    setSelectedSessionIndex((prevIndex) =>
      prevIndex === index ? null : index
    );
    sessionDetailsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Grid container style={{ padding: "20px" }}>
      <Box
        mt={2}
        mb={2}
        display="flex"
        justifyContent="space-between"
        width="100%"
      >
        <Box>
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{
              backgroundColor: "#8e44ad",
              "&:hover": { backgroundColor: "#732d91" },
              marginRight: "10px",
            }}
          >
            <ArrowBackIcon sx={{ color: "white" }} />
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{
              backgroundColor: "#8e44ad",
              "&:hover": { backgroundColor: "#732d91" },
            }}
          >
            <HomeIcon sx={{ color: "white" }} />
          </Button>
        </Box>
      </Box>
      <Grid item xs={12} style={{ marginBottom: "20px" }}>
        <Typography variant="h4">Your Statistics</Typography>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "20px" }}>
        <Typography variant="body1">
          Graph of the conversation you had with AI this year.
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "20px" }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" stroke="#333" />
              <YAxis stroke="#333" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="length" fill="#501968" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "20px" }}>
        <Typography variant="h6">Details Chat Activity</Typography>
        {sessions.length > 2 && (
          <Box mt={2} mb={2}>
            <Button
              variant="contained"
              onClick={() => setViewAll(!viewAll)}
              sx={{
                backgroundColor: "#8e44ad",
                "&:hover": { backgroundColor: "#732d91" },
              }}
            >
              {viewAll ? "Show Less" : "See All"}
            </Button>
          </Box>
        )}
        <Grid container spacing={2} mb={2}>
          {sessions.length === 0 ? (
            <Typography>No sessions available.</Typography>
          ) : (
            sessions
              .slice(0, viewAll ? sessions.length : 2)
              .map((session, index) => (
                <React.Fragment key={index}>
                  <Grid
                    item
                    xs={12}
                    onClick={() => handleSessionClick(index)}
                    sx={{ cursor: "pointer" }} // Change cursor to pointer
                  >
                    <Box
                      display="flex"
                      flexDirection="column"
                      p={2}
                      bgcolor="#f0f0f0"
                      borderRadius="5px"
                    >
                      <Typography variant="body1">
                        {new Date(session.date).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        {session.chats.length} Messages
                      </Typography>
                    </Box>
                  </Grid>
                  {selectedSessionIndex === index && (
                    <Grid item xs={12} ref={sessionDetailsRef}>
                      <Box mt={2} p={2} bgcolor="#f0f0f0" borderRadius="5px">
                        <Button
                          variant="contained"
                          onClick={() => setSelectedSessionIndex(null)}
                          sx={{
                            backgroundColor: "#8e44ad",
                            "&:hover": { backgroundColor: "#732d91" },
                            marginBottom: "10px",
                          }}
                        >
                          Close
                        </Button>
                        <Typography variant="h6">
                          Chat History for{" "}
                          {new Date(session.date).toLocaleString()}
                        </Typography>
                        <ChatHistory
                          chatMessages={session.chats}
                          messagesEndRef={messagesEndRef}
                        />
                      </Box>
                    </Grid>
                  )}
                </React.Fragment>
              ))
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Activity;
