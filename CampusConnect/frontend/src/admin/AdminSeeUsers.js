import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Paper,
  InputBase,
  IconButton,
  Button,
} from "@mui/material";
import UserCard from "./UserCard";
import SearchIcon from "@mui/icons-material/Search";
import { useAuthContext } from "../hooks/useAuthContext";

const AdminSeeUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // Possible values: "all", "banned", "unbanned"
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("https://campusconnectbackend-67br.onrender.com/api/admin/allUsers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      const json = await response.json();
      setUsers(json.users || []);
      console.log(json);
    };
    fetchUsers();
    console.log(users);
  }, [user.token]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleBan = async (userId) => {
    try {
      const response = await fetch(`https://campusconnectbackend-67br.onrender.com/api/admin/banUser/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ isBanned: true }),
      });
      if (!response.ok) {
        throw new Error('Failed to ban user');
      }
      const updatedUsers = users.map(user => 
        user._id === userId ? { ...user, isBanned: true } : user
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleUnban = async (userId) => {
    try {
      const response = await fetch(`https://campusconnectbackend-67br.onrender.com/api/admin/unbanUser/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ isBanned: false }),
      });
      if (!response.ok) {
        throw new Error('Failed to unban user');
      }
      const updatedUsers = users.map(user => 
        user._id === userId ? { ...user, isBanned: false } : user
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const handleFilterChange = (newFilter) => {
    if (filter !== newFilter) {
      setFilter(newFilter);
    }
  };

  let displayHeading = "All Users";
  if (filter === "banned") {
    displayHeading = "Banned Users";
  } else if (filter === "unbanned") {
    displayHeading = "Unbanned Users";
  }

  const filteredUsers = users.filter(user => {
    const searchMatch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === "banned") {
      return user.isBanned && searchMatch;
    }
    if (filter === "unbanned") {
      return !user.isBanned && searchMatch;
    }
    return searchMatch; // Default case for "all"
  });

  return (
    <Container>
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
          placeholder="Search for user"
          inputProps={{ "aria-label": "search for user" }}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>

      <Typography variant="h5" align="left" gutterBottom>
        {displayHeading}
      </Typography>

      <Button onClick={() => handleFilterChange("banned")}>Show Banned Users</Button>
      <Button onClick={() => handleFilterChange("unbanned")}>Show Unbanned Users</Button>

      <Grid container spacing={3}>
        {filteredUsers.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user._id}>
            <UserCard user={user} handleBan={handleBan} handleUnban={handleUnban}/>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminSeeUsers;