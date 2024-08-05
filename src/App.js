import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Activity from "./pages/Activity";
import ActivityDashboard from "./pages/ActivityDashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/dashboard" element={<ActivityDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
