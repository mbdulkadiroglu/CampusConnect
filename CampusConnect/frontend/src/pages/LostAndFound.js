import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Paper,
  InputBase,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Fab,
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ProductCard from "../components/ProductCard";
import { useAuthContext } from "../hooks/useAuthContext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

function FilteredPosts({
  searchTerm,
  selectedCategory,
  selectedStatus,
  sortOption,
  userToken,
}) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unbannedUsers, setUnbannedUsers] = useState([]);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackBarSeverity, setSnackBarSeverity] = useState("success");

  useEffect(() => {
    setIsLoading(true);
    const fetchUnbannedUsers = async () => {
      const userResponse = await fetch("https://campusconnectbackend-67br.onrender.com/api/admin/unbannedUsers", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const userData = await userResponse.json();
      setUnbannedUsers(userData.users || []);
    };

    const fetchPosts = async () => {
      try {
        let url = "https://campusconnectbackend-67br.onrender.com/api/post/all/LostAndFoundPost";
        let queryParams = new URLSearchParams();
        if (searchTerm)
          queryParams.set("searchTerm", encodeURIComponent(searchTerm));
        if (selectedCategory) queryParams.set("category", selectedCategory);
        if (selectedStatus) queryParams.set("status", selectedStatus);

        const response = await fetch(`${url}?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnbannedUsers();
    fetchPosts();
  }, [userToken]);

  // Sorting logic
  const filteredAndSortedPosts = posts
    .filter((post) => unbannedUsers.some((user) => user._id === post.publisher))
    .filter((post) => post.title.toLowerCase().includes(searchTerm))
    .filter(
      (post) => selectedCategory === "" || post.category === selectedCategory
    )
    .filter((post) => selectedStatus === "" || post.status === selectedStatus)
    .sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortOption === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <Grid container spacing={3}>
      {filteredAndSortedPosts.map((post) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={post._id}>
          <ProductCard
            post={post}
            onFavoriteChange={(message, severity) => {
              setSnackBarMessage(message);
              setSnackBarSeverity(severity);
              setSnackBarOpen(true);
            }}
          />
        </Grid>
      ))}
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
    </Grid>
  );
}

function LostAndFound() {
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTab, setSelectedTab] = useState(0); // 0 for Lost, 1 for Found
  const [sortOption, setSortOption] = useState("newest");
  const categories = ["Book", "Electronics", "Clothing", "Other"];
  const navigate = useNavigate();

  const handleAddClick = () => {
    console.log("Navigating to /publish with state:", {
      postType: "LostAndFoundPost",
    });
    navigate("/publish", {
      state: {
        postType: "LostAndFoundPost",
      },
    });
  };

  const handleChangeTab = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ width: "80%", margin: "0 auto" }}>
      <Tabs
        value={selectedTab}
        onChange={handleChangeTab}
        centered
        sx={{ mt: 2 }}
      >
        <Tab label="Lost" value={0} />
        <Tab label="Found" value={1} />
      </Tabs>

      {/* Flex Container for Search Bar, Category, and Sort Options */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap", // Wrap items if not enough space
          my: 2, // Margin top and bottom
        }}
      >
        {/* Category Select */}
        <FormControl sx={{ width: "200px", mr: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Search Bar */}
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            mr: 2, // Margin right
            flex: 1, // Take up available space
            maxWidth: 400, // Maximum width
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search for products"
            inputProps={{ "aria-label": "search for products" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <IconButton sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>

        {/* Sort Select */}
        <FormControl sx={{ width: "200px" }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortOption}
            label="Sort by"
            onChange={(e) => setSortOption(e.target.value)}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Filtered Posts */}
      <FilteredPosts
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedStatus={selectedTab === 0 ? "lost" : "found"}
        sortOption={sortOption}
        userToken={user.token}
      />

      {/* Publish Button */}
      <Fab
        color="primary"
        aria-label="add"
        style={{
          position: "fixed",
          bottom: "5vw",
          right: "15vw",
        }}
        onClick={handleAddClick}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default LostAndFound;
