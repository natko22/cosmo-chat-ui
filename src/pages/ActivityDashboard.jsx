import React, { useEffect, useState } from "react";
import { Grid, Typography, CircularProgress } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import io from "socket.io-client"; // Import socket.io-client

const ActivityDashboard = () => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io("http://localhost:3001"); // Establish socket connection
    socket.on("activityUpdate", (data) => {
      setActivityData(data);
      setLoading(false);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off("activityUpdate");
      socket.disconnect();
    };
  }, []);

  return (
    <Grid container style={{ padding: "20px" }}>
      <Grid item xs={12} style={{ marginBottom: "20px" }}>
        <Typography variant="h4">User Activity Dashboard</Typography>
      </Grid>
      <Grid item xs={12} style={{ height: "400px" }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" />
              <Line type="monotone" dataKey="messagesSent" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Grid>
    </Grid>
  );
};

export default ActivityDashboard;
