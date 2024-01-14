import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  CardActions,
  IconButton,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block"; // for the suspend icon
import LockOpenIcon from '@mui/icons-material/LockOpen';

const UserCard = ({ user, handleBan, handleUnban }) => {
  // Function to truncate the name if it's too long
  const truncateName = (name, maxLength) => {
    if (name.length > maxLength) {
      return name.substring(0, maxLength - 3) + '...'; // Adjust maxLength as needed
    }
    return name;
  };

  return (
    <Card sx={{ display: "flex", alignItems: "center", padding: 2, minWidth: 275 }}>
      <Avatar
        alt={user.firstName + " " + user.lastName}
        src={user.photo}
        sx={{ width: 56, height: 56, marginRight: 2 }}
      />
      <CardContent sx={{ flex: "1 0 auto" }}>
        <Typography variant="h6" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {truncateName(user.firstName + " " + user.lastName, 20)}
        </Typography>
        <Typography variant="body2">{user.department}</Typography>
        <Typography variant="body2">{user.jobTitle}</Typography>
      </CardContent>
      <CardActions>
        {user.isBanned ?
            <IconButton size="small" color="secondary" onClick={() => handleUnban(user._id)}>
                <LockOpenIcon />
            </IconButton>
            :
            <IconButton size="small" color="secondary" onClick={() => handleBan(user._id)}>
                <BlockIcon />
            </IconButton>
        }
      </CardActions>
    </Card>
  );
};

export default UserCard;