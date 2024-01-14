import React, { useState, useEffect } from "react";
import { Avatar, Tabs, Tab, Typography, Button, TextField, Box } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ProductCard from "../components/ProductCard";
import { Grid } from "@mui/material";
import { Link } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate} from 'react-router-dom';
import Settings from './Settings';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

function ProfilePage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [snackBarSeverity, setSnackBarSeverity] = useState('success');

  const navigateToSettings = () => {
    navigate('/settings') // Assuming '/settings' is the route for the Settings page
  };



  const handleClose = () => {
    setAction('');
    setOpen(false);
  };
  const [value, setValue] = useState(0);
  const [posts, setPosts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [newPassword, setNewPassword] = useState("");
  const [fetchAgain, setFetchAgain] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("https://campusconnectbackend-67br.onrender.com/api/user/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      const json = await response.json();
      setPosts(json.posts || []);

    };

    const fetchFavorites = async () => {
      const response = await fetch("https://campusconnectbackend-67br.onrender.com/api/user/favorites", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      const json = await response.json();
      setFavorites(json.favorites || []);

    };

    if (user && user.token) {
      fetchProducts(); // Fetch the user's posts
      fetchFavorites(); // Fetch the user's favorites
      console.log(posts);
    }

  }, [user.token, fetchAgain]);

  const handleDeleteProduct = async (event, postId) => {
    // Prevent event from bubbling up
    event.stopPropagation();

    // Send request to backend to delete the product
    const response = await fetch(`https://campusconnectbackend-67br.onrender.com/api/post/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    if (response.ok) {
      // Update the posts state to remove the deleted product
      console.log("deleted");
      setPosts(posts.filter((post) => post._id !== postId));
      setSnackBarMessage("Post is successfully deleted!");
      setSnackBarSeverity("success");
      setSnackBarOpen(true);
    } else {
      console.log(response.body);
      setSnackBarMessage("Post cannot be deleted!");
      setSnackBarSeverity("error");
      setSnackBarOpen(true);
    }
  };


  return (
    <div style={{ width: "80%", margin: "0 auto", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {user && (
            <>
              <Avatar
                alt="User Name"
                //src="/path-to-user-image.jpg"
                style={{ width: 60, height: 60, marginBottom: "0.5rem" }} // Adjust size as needed
              />
              <Typography variant="h5" style={{ fontWeight: "bold" }}>
                {user.firstName + " " + user.lastName}
              </Typography>
              <Typography variant="subtitle1" style={{ fontWeight: "normal" }}>
                {user.email}
              </Typography>
              <Typography variant="subtitle1" style={{ fontWeight: "normal" }}>
                {user.memberType}
              </Typography>
            </>
          )}
        </div>
        <div style={{ display: "flex" }}>

          <Link to="feedback" style={{ marginRight: "10px" }}>
            <Button variant="outlined" color="primary">
              Give us feedback!
            </Button>
          </Link>
          <Button
            variant="outlined"
            style={{ marginRight: "10px" }}
            onClick={navigateToSettings}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            color="error"
            style={{ color: "white" }}
            onClick={logout}
          >
            Logout
          </Button>
        </div>
      </div>

      <Tabs
        value={value}
        onChange={handleChange}
        centered
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab
          label="| Listings |"
          style={{ color: "black", fontWeight: "bold" }}

        />
        <Tab
          label="| Favorites |"

          style={{ color: "black", fontWeight: "bold" }}
        />
      </Tabs>


      {/* Adding spacing */}
      <Box sx={{ height: "2rem" }} />

      {value === 0 && (
        <Grid container spacing={3}> {/* Ensure this spacing value matches RecentSHS */}
          {posts.map((post) => (
            post && post.postType ? (
              <Grid item xs={12} sm={6} md={4} lg={3} key={post._id}>
                <ProductCard
                  key={post._id}
                  post={post}
                  myProduct={true}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  onDelete={(event) => handleDeleteProduct(event, post._id)}
                  onFavoriteChange={(message, severity) => {
                    setSnackBarMessage(message);
                    setSnackBarSeverity(severity);
                    setSnackBarOpen(true);
                  }}
                  onUpdate={(message, severity) => {
                    setSnackBarMessage(message);
                    setSnackBarSeverity(severity);
                    setSnackBarOpen(true);
                  }}
                />
              </Grid>
            ) : null
          ))}
        </Grid>
      )}

      {value === 1 && (
        <Grid container spacing={3}> {/* Use Grid container for consistent layout */}
          {favorites.map((post) => (
            post && post.postType ? (
              <Grid item xs={12} sm={6} md={4} lg={3} key={post._id}> {/* These sizes should match the ones used in your listings and RecentSHS */}
                <ProductCard
                  key={post._id}
                  post={post}
                  myProduct={false}
                  onFavoriteChange={(message, severity) => {
                    setSnackBarMessage(message);
                    setSnackBarSeverity(severity);
                    setSnackBarOpen(true);
                  }}
                />
              </Grid>
            ) : null
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackBarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackBarOpen(false)} severity={snackBarSeverity} sx={{ width: '100%' }}>
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ProfilePage;