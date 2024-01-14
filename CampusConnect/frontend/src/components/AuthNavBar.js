import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import MessageIcon from "@mui/icons-material/Message";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationDropdown from './NotificationDropdown';
import { useAuthContext } from "../hooks/useAuthContext";

function Navbar() {
  const [activeFeature, setActiveFeature] = useState("");
  const location = useLocation();
  const {user} = useAuthContext();
  const navigate = useNavigate();
  useEffect(() => {
    const pathFeatureMap = {
      '/sale': 'Second-Hand Sale',
      '/lostandfound': 'Lost&Found',
      '/donation': 'Donation',
      '/borrow': 'Borrow',
      '/flatdormmate': 'Flat/Dorm Mate',
    };
    const feature = Object.keys(pathFeatureMap).find(key => location.pathname.startsWith(key));
    setActiveFeature(feature ? pathFeatureMap[feature] : '');
  }, [location]);

  const handleFeatureClick = (featureName, url) => {
    setActiveFeature(featureName);
    window.location.href = `/${url}`
    //navigate(`/${url}`);
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { title: "New message from Ulaş Dilekçi", time: "2 mins ago", seen: false },
    { title: "New message from Ali Cevat", time: "1 hour ago", seen: false },
    { title: "Whishlisted item sold", time: "1 day ago", seen: true },
  ]);
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const featureColors = {
    'Second-Hand Sale': 'cadetblue',
    'Lost&Found': '#4C8A66',
    'Donation': '#3384A5',
    'Borrow': '#AA70B0',
    'Flat/Dorm Mate': '#B74582',
  };

  const featureUrls = {
    'Second-Hand Sale': 'sale',
    'Lost&Found': 'lostandfound',
    'Donation': 'donation',
    'Borrow': 'borrow',
    'Flat/Dorm Mate': 'flatdormmate',
  };
  const featureStyles = (featureName) => ({
    margin: '0 8px 0 0', // Adjusted bottom margin
    borderRadius: '4px',
    color: activeFeature === featureName ? featureColors[featureName] : '#000', // Text color is the feature color when active
    backgroundColor: activeFeature === featureName ? '#fff' : "transparent",
    '&:hover': {
      backgroundColor: activeFeature === featureName ? '#fff' : "rgba(0, 0, 0, 0.04)",
      color: activeFeature === featureName ? featureColors[featureName] : '#000', // Keep text color on hover
    },
    textDecoration: 'none',
    fontWeight: 'bold',
  });
  const appBarStyle = {
    backgroundColor: featureColors[activeFeature] || 'inherit',
  };

  const getBackgroundColor = (feature) => {
    return activeFeature === feature ? featureColors[feature] : "";
  };


  const closeNotifications = () => {
    setShowNotifications(false);
  };

  return (
    <AppBar position="static" color="inherit" sx={appBarStyle}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Button
          component={Link}
          to="/sale"
          color="inherit"
          sx={{
            margin: '0 8px', // Consistent with other buttons
            borderRadius: '4px', // Optional: Rounded corners
            backgroundColor: activeFeature === "sale" ? "rgba(255, 255, 255, 0.2)" : "", // Use a lighter shade for a subtle effect
            '&:hover': {
              backgroundColor: "rgba(255, 255, 255, 0.4)", // Darker on hover for visual feedback
            },
            textDecoration: 'none'
          }}
        >
          <img
            src="logo512.png" 
            alt="CampusConnect Logo"
            style={{
              marginRight: '8px', 
              width: 'auto', 
              height: '32px'
            }}
          />
          <Typography variant="h6" component="div" style={{ textTransform: 'none', fontWeight: 'bold' }}>
            CampusConnect
          </Typography>

        </Button>

        <Box sx={{ display: 'flex' }}>
          {Object.entries(featureUrls).map(([featureName, url]) => (
            <Button
              key={featureName}
              onClick={() => handleFeatureClick(featureName, url)}
              sx={featureStyles(featureName)}
            >
              {featureName}
            </Button>
          ))}
        </Box>



        <div>
          { user && user.isAdmin &&  (
            <IconButton color="inherit" component={Link} to="/admin">
            <Badge color="secondary">
              <AdminPanelSettingsIcon />
            </Badge>
          </IconButton>
          )}

          <IconButton color="inherit" component={Link} to="/messages">
            <Badge color="secondary">
              <MessageIcon />
            </Badge>
          </IconButton>
          <IconButton
            color="inherit"
            component={Link}
            to="/profile"

          >
            <AccountCircleIcon />
          </IconButton>
          <NotificationDropdown
            notifications={notifications}
            isOpen={showNotifications}
            onClose={closeNotifications} // Passing the close function
          />
        </div>

      </Toolbar>
    </AppBar>
  );
}

export default Navbar;