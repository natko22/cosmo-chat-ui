import React from "react";
import { Button, Box, Typography, keyframes } from "@mui/material";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../assets/images/istockphoto-165753498-612x612.jpg";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

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
      sx={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        animation: `${fadeIn} 1s ease-in-out`,
      }}
    >
      <Typography
        variant="h2"
        gutterBottom
        sx={{
          color: "white",
          fontFamily: "typewriter",
          textAlign: "center",
          animation: `${fadeIn} 2s ease-in-out`,
          marginBottom: "20px",
        }}
      >
        Welcome to Cosmo Chat
      </Typography>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "white",
          fontFamily: "typewriter",
          textAlign: "center",
          animation: `${fadeIn} 3s ease-in-out`,
          marginBottom: "40px",
        }}
      >
        Connect with the universe
      </Typography>
      <Button
        variant="contained"
        onClick={handleStartChat}
        sx={{
          animation: `${fadeIn} 4s ease-in-out`,
          padding: "15px 30px",
          fontSize: "18px",
          backgroundColor: "#7828aacf",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#7828aacf",
            transform: "scale(1.1)",
            transition: "transform 0.3s",
          },
          "&:active": {
            backgroundColor: "#7828aacf",
            transform: "scale(0.9)",
            transition: "transform 0.2s",
          },
        }}
      >
        Start Chat
      </Button>
    </Box>
  );
};

export default Home;
