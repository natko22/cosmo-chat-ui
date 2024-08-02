// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Chat from "./pages/Chat";
import Activity from "./pages/Activity";
import ActivityDashboard from "./pages/ActivityDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/dashboard" element={<ActivityDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
