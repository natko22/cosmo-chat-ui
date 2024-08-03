import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  CircularProgress,
  Typography,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "notistack"; // Import useSnackbar
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
import axios from "axios";

// Function to fetch sessions from local storage
const fetchSessions = () => {
  const storedSessions = JSON.parse(localStorage.getItem("sessions")) || [];
  return storedSessions;
};

// Function to calculate metrics for the bar chart
const calculateMetrics = (sessions) => {
  let activeUsers = new Set();
  let messagesSent = 0;
  let sessionsInitiated = sessions.length;
  let engagementIndicators = {};

  sessions.forEach((session) => {
    session.chats.forEach((chat) => {
      activeUsers.add(chat.sender);
      messagesSent += 1;
      const date = chat.timestamp.split("T")[0];
      if (!engagementIndicators[date]) {
        engagementIndicators[date] = { date, messages: 0, sessions: 0 };
      }
      engagementIndicators[date].messages += 1;
    });
  });

  return {
    activeUsers: activeUsers.size,
    messagesSent,
    sessionsInitiated,
    engagementIndicators: Object.values(engagementIndicators),
  };
};

const Activity = () => {
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    messagesSent: 0,
    sessionsInitiated: 0,
    engagementIndicators: [],
  }); // State for metrics
  const [sessionDates, setSessionDates] = useState([]); // State for session dates
  const [sessionChatLengths, setSessionChatLengths] = useState([]); // State for session chat lengths
  const [sessions, setSessions] = useState([]); // State for sessions data
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(null); // State for selected session index
  const [viewAll, setViewAll] = useState(false); // State for toggling view all sessions
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // State for delete confirmation dialog
  const [sessionToDelete, setSessionToDelete] = useState(null); // State for the session to be deleted
  const messagesEndRef = useRef(null); // Ref for auto-scrolling to the end of messages
  const navigate = useNavigate(); // Hook to programmatically navigate
  const sessionDetailsRef = useRef(null); // Ref for scrolling to session details
  const { enqueueSnackbar } = useSnackbar(); // Use useSnackbar hook

  // Fetch sessions from local storage on component mount
  useEffect(() => {
    const fetchSessionsData = () => {
      const storedSessions = fetchSessions();
      setSessions(storedSessions.reverse());
      const newMetrics = calculateMetrics(storedSessions);
      setMetrics(newMetrics);
      setSessionDates(storedSessions.map((data) => data.date));
      setSessionChatLengths(storedSessions.map((data) => data.chats.length));
      setLoading(false);
    };
    fetchSessionsData();
  }, []);

  // Prepare data for the bar chart
  const data = sessionDates.map((date, index) => ({
    date,
    length: sessionChatLengths[index],
  }));

  // Custom tooltip for the bar chart
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

  // Handle session click to toggle display of session details
  const handleSessionClick = (index) => {
    setSelectedSessionIndex((prevIndex) =>
      prevIndex === index ? null : index
    );
    sessionDetailsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle delete confirmation dialog open
  const handleOpenDeleteDialog = (session) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation dialog close
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  // Handle deleting a session
  const handleDeleteSession = async () => {
    if (sessionToDelete) {
      const encodedDate = encodeURIComponent(sessionToDelete.date);
      console.log("Deleting session with date:", sessionToDelete.date);
      try {
        await axios.delete(`http://localhost:3001/sessions/${encodedDate}`);
        const updatedSessions = sessions.filter(
          (session) => session.date !== sessionToDelete.date
        );
        setSessions(updatedSessions);
        const newMetrics = calculateMetrics(updatedSessions);
        setMetrics(newMetrics);
        handleCloseDeleteDialog(); // Close dialog after deletion
        enqueueSnackbar("Session deleted successfully !", {
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
          style: {
            backgroundColor: "#8e44ad",
            color: "#fff",
            textAlign: "center",
          },
        });
      } catch (error) {
        console.error("Error deleting session:", error);
        enqueueSnackbar("Error deleting session", {
          variant: "error",
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
          style: {
            backgroundColor: "#f44336",
            color: "#fff",
          },
        });
      }
    }
  };

  return (
    <Grid container style={{ padding: "20px" }} justifyContent="flex-start">
      <Box
        mt={2}
        mb={2}
        display="flex"
        justifyContent="space-between"
        width="100%"
      >
        {/* Navigation Buttons */}
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
      {/* Page Title */}
      <Grid item xs={12} style={{ marginBottom: "20px" }}>
        <Typography variant="h4">Your Statistics</Typography>
      </Grid>
      {/* Page Description */}
      <Grid item xs={12} style={{ marginBottom: "20px" }}>
        <Typography variant="body1">
          Graph of the conversation you had with AI this year.
        </Typography>
      </Grid>
      {/* Bar Chart */}
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
      {/* Session Details */}
      <Grid item xs={12} md={8} lg={6} style={{ marginBottom: "20px" }}>
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
                    sx={{ cursor: "pointer" }}
                  >
                    <Box
                      display="flex"
                      flexDirection="column"
                      p={2}
                      bgcolor="#f0f0f0"
                      borderRadius="5px"
                      boxShadow={3}
                      width="100%"
                    >
                      <Typography variant="body1">
                        {new Date(session.date).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        {session.chats.length} Messages
                      </Typography>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering session click
                          handleOpenDeleteDialog(session);
                        }}
                        sx={{
                          marginTop: "-45px",
                          width: "fit-content",
                          alignSelf: "flex-end",
                          backgroundColor: "#e03636",
                          "&:hover": { backgroundColor: "#c0392b" },
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    </Box>
                  </Grid>
                  {selectedSessionIndex === index && (
                    <Grid item xs={12}>
                      <Box
                        mt={2}
                        p={2}
                        bgcolor="#f0f0f0"
                        borderRadius="5px"
                        boxShadow={3}
                        width="100%"
                      >
                        <Box display="flex" justifyContent="flex-end">
                          <Button
                            variant="contained"
                            onClick={() => setSelectedSessionIndex(null)}
                            sx={{
                              backgroundColor: "#8e44ad",
                              "&:hover": { backgroundColor: "#732d91" },
                              marginBottom: "10px",
                            }}
                          >
                            <CloseIcon sx={{ color: "white" }} />
                          </Button>
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{ marginTop: "-3rem", paddingBottom: "20px" }}
                        >
                          Chat History for{" "}
                          {new Date(session.date).toLocaleString()}
                        </Typography>
                        <ChatHistory
                          chatMessages={session.chats}
                          messagesEndRef={messagesEndRef}
                          sx={{ marginTop: "1rem" }} // Add this line
                        />
                      </Box>{" "}
                    </Grid>
                  )}
                </React.Fragment>
              ))
          )}
        </Grid>
      </Grid>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{
              fontFamily: "Typewriter",
            }}
          >
            Are you sure you want to delete this session? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteSession} color="secondary">
            Delete
          </Button>
          <Button onClick={handleCloseDeleteDialog} color="error" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default Activity;
