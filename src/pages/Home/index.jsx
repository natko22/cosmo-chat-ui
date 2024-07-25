import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate("/chat");
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="#282c34"
      color="white"
      fontFamily={"typewriter"}
      textAlign="center"
    >
      <Typography variant="h3" gutterBottom>
        Welcome to Cosmo Chat
      </Typography>
      <Button variant="contained" color="secondary" onClick={handleStartChat}>
        Start Chat
      </Button>
    </Box>
  );
};

export default Home;
