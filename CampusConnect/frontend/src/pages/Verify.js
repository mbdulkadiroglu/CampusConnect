import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import {Link} from "react-router-dom";
import { Button, Paper, Typography, Box, CircularProgress } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';


const VerificationPage = () => {
  const { token } = useParams(); // Extract the token from the URL
  const { dispatch } = useAuthContext();

  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`https://campusconnectbackend-67br.onrender.com/api/user/verify/${token}`);
        const result = await response.json();
        setVerificationResult(result);
        
      } catch (err) {
        console.log("Error verifying token:", err);
        setVerificationResult({ error: err});
      }
      dispatch({ type: "LOGOUT"});
    };
    
    verifyToken();
  }, [token]); // The effect will run whenever the 'token' changes

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: '400px',
        margin: 'auto',
        textAlign: 'center',
        padding: '20px',
        mt: '50px',
      }}
    >
      {verificationResult ? (
        verificationResult.verified ? (
          <Box>
            <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 60 }} />
            <Typography variant="h5" color="primary" gutterBottom>
              Verification Successful
            </Typography>
            <Typography>Success! Your account has been verified.</Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/login"
              sx={{ mt: 2 }}
            >
              Click here to login
            </Button>
          </Box>
        ) : verificationResult.expired ? (
          <Box>
            <HighlightOffIcon color="error" sx={{ fontSize: 60 }} />
            <Typography variant="h5" color="error.main" gutterBottom>
              Verification Failed
            </Typography>
            <Typography>Error: Verification link has expired.</Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/register"
              sx={{ mt: 2 }}
            >
              Click here to register again
            </Button>
          </Box>
        ) : (
          <Box>
            <HighlightOffIcon color="error" sx={{ fontSize: 60 }} />
            <Typography variant="h5" color="error.main" gutterBottom>
              Verification Failed
            </Typography>
            <Typography>Error: Invalid verification link.</Typography>
            <Typography>Please check that you have the correct verification link.</Typography>
          </Box>
        )
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};

export default VerificationPage;