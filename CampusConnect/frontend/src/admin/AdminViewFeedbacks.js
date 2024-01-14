import React, { useState, useEffect } from "react";
import { Grid, Box, Paper, InputBase, IconButton, FormControl, InputLabel, Select, MenuItem, CircularProgress, Fab, Tabs, Tab } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FeedbackCard from "../components/FeedbackCard";
import { useAuthContext } from "../hooks/useAuthContext";  

function FilteredFeedbacks({ searchTerm, selectedType, selectedStatus, sortOption, userToken }) {
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      setIsLoading(true);
      fetchFeedbacks();
    }, [userToken]);

    const fetchFeedbacks = async () => {
        try {
          let url = "https://campusconnectbackend-67br.onrender.com/api/feedback/";
          let queryParams = new URLSearchParams();
          if (searchTerm) queryParams.set('searchTerm', encodeURIComponent(searchTerm));
          if (selectedType) queryParams.set('type', selectedType);
          if (selectedStatus) queryParams.set('status', selectedStatus);
  
          const response = await fetch(`${url}?${queryParams.toString()}`, {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          });
          const data = await response.json();
          setFeedbacks(data.feedbacks || []);
        } catch (error) {
          console.error("Error fetching feedbacks:", error);
        } finally {
          setIsLoading(false);
        }
      };

    const handleResolveClick = async (feedbackId, currentResolvedStatus) => {
        try {
            const response = await fetch(`https://campusconnectbackend-67br.onrender.com/api/feedback/${feedbackId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify({ isResolved: currentResolvedStatus }),
            });

            if (response.ok) {
                fetchFeedbacks();
            } else {
                console.error("Failed to toggle feedback resolved status");
            }
        } catch (error) {
            console.error("Error toggling feedback resolved status:", error);
        }
    };

    const handleAddComment = async (feedbackId, commentText) => {
      commentText = commentText.trim();
      if (commentText === "") {
        return;
      }
        try {
            const response = await fetch(`https://campusconnectbackend-67br.onrender.com/api/feedback/addComment/${feedbackId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify({ text: commentText }),
            });
            if (response.ok) {
                fetchFeedbacks(); 
            } else {
                const errorData = await response.json();
                console.error("Failed to add comment:", errorData.message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleDeleteFeedback = async (feedbackId) => {
        try {
            const response = await fetch(`https://campusconnectbackend-67br.onrender.com/api/feedback/${feedbackId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                },
            });

            if (response.ok) {
                setFeedbacks(feedbacks.filter(feedback => feedback._id !== feedbackId));
            } else {
                console.error("Failed to delete feedback");
            }
        } catch (error) {
            console.error("Error deleting feedback:", error);
        }
    };
  
    // Sorting logic
    const filteredAndSortedFeedbacks = feedbacks
      .filter((feedback) => feedback.content.toLowerCase().includes(searchTerm))
      .filter((feedback) => selectedType === "" || feedback.type === selectedType)
      .filter((feedback) => selectedStatus === "" || feedback.isResolved === selectedStatus) // TODO: feedback has isResolved as bool
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </div>
      );
    }
  
    return (
      <Grid container spacing={3}>
        {filteredAndSortedFeedbacks.map((feedback) => (
          <Grid item xs={12} sm={6} md={4} lg={4} key={feedback._id}>
            <FeedbackCard
                feedback={feedback}
                onResolve={(feedbackId, updatedResolvedStatus) => handleResolveClick(feedbackId, updatedResolvedStatus)}
                onComment={(feedbackId, commentText) => handleAddComment(feedbackId, commentText)}
                onDelete={(feedbackId) => handleDeleteFeedback(feedbackId)}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

function AdminViewFeedbacks() {
    const { user } = useAuthContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedTab, setSelectedTab] = useState(false); // false for Unresolved, true for Resolved
    const [sortOption, setSortOption] = useState("newest");
    const types = ["Bug", "Suggestion", "Other"];
  
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
          <Tab label="Unresolved" value={false}/>
          <Tab label="Resolved" value={true}/>
        </Tabs>
  
        {/* Flex Container for Search Bar, Category, and Sort Options */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', // Wrap items if not enough space
            my: 2 // Margin top and bottom
          }}
        >
  
          {/* Type Select */}
          <FormControl sx={{ width: "200px", mr: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedType}
              label="Type"
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {types.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
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
              maxWidth: 400 // Maximum width
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search for feedbacks"
              inputProps={{ "aria-label": "search for feedbacks" }}
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
        <FilteredFeedbacks
          searchTerm={searchTerm}
          selectedType={selectedType}
          selectedStatus={selectedTab}
          sortOption={sortOption}
          userToken={user.token}
        />

      </Box>
    );
  }

export default AdminViewFeedbacks;
