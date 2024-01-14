import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Paper,
  InputBase,
  IconButton,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAuthContext } from "../hooks/useAuthContext";
import ProductCard from "../components/ProductCard";

const AdminSeePosts = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("https://campusconnectbackend-67br.onrender.com/api/admin/allPosts", {
          headers: {
            "Authorization": `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        setPosts(data.posts || []); // Adjust this based on your API's response structure
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchPosts();
  }, [user.token]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    } else {
      console.log(response.body);
    }
  };

  return (
    <Box px={4} pb={4} pt={0} style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Paper
        component="form"
        sx={{
          p: "2px 4px",
          display: "flex",
          alignItems: "center",
          width: 400,
          margin: "20px auto",
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search for items"
          inputProps={{ "aria-label": "search for items" }}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>

      <Typography variant="h6" mb={2} align="center">
        All Posts
      </Typography>

      <Grid container spacing={3}>
        {filteredPosts.map(post => (
          <Grid item xs={12} sm={6} md={3} key={post._id}>
            <ProductCard 
            key={post._id}
            post={post} 
            myProduct={false}
            isAdmin={true}
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
            onDelete={(event) => handleDeleteProduct(event, post._id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminSeePosts;
