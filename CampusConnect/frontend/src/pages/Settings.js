import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const Settings = () => {
  const { user } = useAuthContext();
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState("success");
  const navigate = useNavigate();

  const handleNameChange = async () => {
    if (!window.confirm("Are you sure you want to update your name?")) {
      return;
    }
    try {
      const response = await fetch('https://campusconnectbackend-67br.onrender.com/api/user/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Update was successful
        console.log(data);
        user.firstName = firstName;
        user.lastName = lastName;
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Name updated successfully.');
        navigate('/profile');

      } else {
        // Update faile
        setSnackBarMessage("Failed to update name!");
        setSnackBarSeverity("error");
        setSnackBarOpen(true);
        console.error('Failed to update name:', data.error);
      }
    } catch (error) {
      console.error('Failed to update name:', error);
      setSnackBarMessage("Failed to update name!");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || newPassword.length < 6) {
      setSnackBarMessage("Please fill in all fields and ensure the new password is at least 6 characters.");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
      return;
    }

    try {
      const response = await fetch('https://campusconnectbackend-67br.onrender.com/api/user/updateUser', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        console.log('Password updated successfully.');
        setNewPassword('');
        setOldPassword('');
        setSnackBarMessage("Password updated successfully!");
        setSnackBarSeverity("success");
        setSnackBarOpen(true);

      } else {
        const errorText = await response.text();
        console.error('Failed to update password:', errorText);
        setSnackBarMessage("Failed to update password!");
        setSnackBarSeverity("error");
        setSnackBarOpen(true);
      }
    } catch (error) {
      console.error('Failed to update password:', error);
      setSnackBarMessage("Failed to update password!");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
    }
  };
  return (
    <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>Change Name</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
        <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
        <Button variant="contained" color="primary" onClick={handleNameChange}>Update Name</Button>
      </Box>


      <Typography variant="h6" gutterBottom>Change Password</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Old Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} fullWidth />
        <TextField label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth />
        <Button variant="contained" color="primary" onClick={handlePasswordChange}>Update Password</Button>
      </Box>
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackBarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackBarOpen(false)}
          severity={snackBarSeverity}
          sx={{ width: "100%" }}
        >
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
