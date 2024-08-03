import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Fetch sessions from local storage
const fetchSessions = () => {
  const storedSessions = JSON.parse(localStorage.getItem("sessions")) || [];
  return storedSessions;
};

// Calculate metrics based on sessions data
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
      engagementIndicators[date].sessions += 1;
    });
  });

  return {
    activeUsers: activeUsers.size,
    messagesSent,
    sessionsInitiated,
    engagementIndicators: Object.values(engagementIndicators),
  };
};

const ActivityDashboard = () => {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    messagesSent: 0,
    sessionsInitiated: 0,
    engagementIndicators: [],
  });
  const [startDate, setStartDate] = useState(null); // State for start date filter
  const [endDate, setEndDate] = useState(null); // State for end date filter
  const navigate = useNavigate(); // Hook to programmatically navigate

  // Effect to fetch sessions and calculate metrics based on date filters
  useEffect(() => {
    const sessions = fetchSessions();
    const filteredSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return (
        (!startDate || sessionDate >= new Date(startDate)) &&
        (!endDate || sessionDate <= new Date(endDate))
      );
    });
    const newMetrics = calculateMetrics(filteredSessions);
    setMetrics(newMetrics);
  }, [startDate, endDate]);

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
          {/* Navigation Buttons */}
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
        <Typography variant="h4">Activity Dashboard</Typography>
      </Box>
      <Grid item xs={12} style={{ marginBottom: "20px" }}>
        {/* Date Pickers for filtering sessions */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            <Grid item>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
            <Grid item>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Grid>
      {/* Metrics Display */}
      <Grid item xs={12} md={4}>
        <Typography variant="h6">
          Active Users: {metrics.activeUsers}
        </Typography>
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography variant="h6">
          Messages Sent: {metrics.messagesSent}
        </Typography>
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography variant="h6">
          Sessions Initiated: {metrics.sessionsInitiated}
        </Typography>
      </Grid>
      {/* Bar Chart */}
      <Grid item xs={12} style={{ marginTop: "20px" }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={metrics.engagementIndicators}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="messages" fill="#78218b8f" />
            <Bar dataKey="sessions" fill="#8884d8c4" />
          </BarChart>
        </ResponsiveContainer>
      </Grid>
      {/* Line Chart */}
      <Grid item xs={12} style={{ marginTop: "20px" }}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={metrics.engagementIndicators}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="messages" stroke="#78218b8f" />
            <Line type="monotone" dataKey="sessions" stroke="#8884d8c4" />
          </LineChart>
        </ResponsiveContainer>
      </Grid>
    </Grid>
  );
};

export default ActivityDashboard;
