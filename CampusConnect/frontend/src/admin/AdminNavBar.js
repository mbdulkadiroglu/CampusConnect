import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Link } from "react-router-dom";

function Navbar() {
  const [activeFeature, setActiveFeature] = useState("");

  const handleFeatureClick = (feature) => {
    setActiveFeature(feature);
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>

      <Button
        component={Link}
        to="/sale"
        color="inherit"
        sx={{
          margin: '0 8px', // Consistent with other buttons
          borderRadius: '4px', // Optional: Rounded corners
          backgroundColor: activeFeature === "sale" ? "rgba(255, 255, 255, 0.2)" : "", // Lighter shade for subtle effect
          '&:hover': {
            backgroundColor: "rgba(255, 255, 255, 0.4)", // Darker on hover for visual feedback
          },
          textDecoration: 'none'
        }}
        onClick={() => handleFeatureClick("sale")}
      >
        <Typography variant="h6" component="div" style={{ textTransform: 'none', display: 'flex', alignItems: 'center' }}>
          CampusConnect
        </Typography>
        <Typography variant="h6">
          <span
            style={{
              marginLeft: "3px",
              verticalAlign: "sub",
              fontSize: "smaller",
            }}
          >
            ADMIN
          </span>
        </Typography>
      </Button>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            component={Link}
            to="/admin"
            color="inherit"
            sx={{
              backgroundColor:
                activeFeature === "posts" ? "rgba(255, 255, 255, 0.1)" : "",
            }}
            onClick={() => handleFeatureClick("posts")}
          >
            Users
          </Button>
          <Button
            component={Link}
            to="/admin/seeposts"
            color="inherit"
            sx={{
              backgroundColor:
                activeFeature === "users" ? "rgba(255, 255, 255, 0.1)" : "",
            }}
            onClick={() => handleFeatureClick("users")}
          >
            Posts
          </Button>
          <Button
            component={Link}
            to="/admin/viewfeedbacks"
            color="inherit"
            sx={{
              backgroundColor:
                activeFeature === "feedbacks" ? "rgba(255, 255, 255, 0.1)" : "",
            }}
            onClick={() => handleFeatureClick("feedbacks")}
          >
            Feedbacks
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;