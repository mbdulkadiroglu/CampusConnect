import React from "react";
import { Button, Card, CardContent, Typography, IconButton, Box } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";

const SeekerCard = ({ index,title, description, onFavoriteClick }) => {

  const navigate = useNavigate();
  const borderColor = "lightgreen";

  const handleBrowse = () => {
    navigate(`/seek/${index}`);
  };
  return (
    <Card sx={{ maxWidth: 345, border: `1px solid ${borderColor}` }}>
      <Box sx={{ position: "relative" }}>
        <IconButton
          aria-label="add to favorites"
          onClick={onFavoriteClick}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.85)",
            },
          }}
        >
          <FavoriteIcon />
        </IconButton>
      </Box>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <Button 
        variant="contained"
        onClick={handleBrowse}
        sx={{ marginTop: 2, borderColor, color: 'white', backgroundColor: borderColor }} 
      >
        Browse
      </Button>
      </CardContent>
    </Card>
  );
};

export default SeekerCard;
