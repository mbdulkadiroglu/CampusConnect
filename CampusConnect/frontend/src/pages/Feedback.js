import React, { useState, useContext } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Rating,
  FormControl, InputLabel, MenuItem, Select
} from "@mui/material";
import { useAuthContext } from "../hooks/useAuthContext";

function FeedbackPage() {
  const { user } = useAuthContext();

  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });
  const [tipContent, setTipContent] = useState("Please choose a feedback type");

  const handleTypeChange = (event) => {
    setFeedback({ ...feedback, type: event.target.value });
    switch (event.target.value) {
      case "Bug":
        setTipContent("Please also explain how the bug can be reproduced");
        break;
      case "Suggestion":
        setTipContent("Please explain the specific feature you would like to see");
        break;
      case "Other":
        setTipContent("Please explain your feedback in detail");
        break;
      default:
        setTipContent("Please choose a feedback type");
        break;
    }
  }

  const handleMessageChange = (event) => {
    setFeedback({ ...feedback, message: event.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (feedback.message.trim() === "" || feedback.type === "") {
      alert("Please fill in all fields.");
      return;
    }

    const feedbackData = {
      content: feedback.message,
      type: feedback.type, // This should match the enum in your feedback model
      // Uncomment this if you want to send email
    };

    try {
      const response = await fetch('https://campusconnectbackend-67br.onrender.com/api/feedback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(feedbackData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Feedback submitted. Thank you!");
        setFeedback({ message: "", type: "" }); // Reset form
        // Redirect or update UI accordingly


      } else {
        // Handle server-side validation errors
        alert(result.error);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('An error occurred while submitting your feedback. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Paper style={{ padding: "40px", width: 600, margin: "auto" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Send Feedback
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {tipContent}
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type of Feedback</InputLabel>
            <Select
              value={feedback.type}
              label="Type of Feedback"
              onChange={handleTypeChange}
            >
              <MenuItem value="Bug">Bug</MenuItem>
              <MenuItem value="Suggestion">Suggestion</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="Feedback"
            name="message"
            multiline
            rows={6}
            value={feedback.message}
            onChange={handleMessageChange}
            variant="outlined"
          />
          <Button
            type="submit"
            color="primary"
            variant="contained"
            fullWidth
            sx={{ mt: 3, py: 1.5, fontSize: "1.2rem" }}
          >
            Submit Feedback
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default FeedbackPage;
