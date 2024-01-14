import React from "react";
import { Button, Card, CardContent, CardMedia, Typography, IconButton, Box } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";
const OwnerCard = ({ index,title, description, imageUrl, onFavoriteClick }) => {

const navigate = useNavigate();
const borderColor = "turquoise";

const handleBrowse = () => {
  navigate(`/owner/${index}`);
};
  return (
    <Card sx={{ maxWidth: 345, border: `1px solid ${borderColor}` }}>
      <Box sx={{ position: "relative" }}>
        {imageUrl && (
          <CardMedia
            component="img"
            height="140"
            image={imageUrl}
            alt={title}
          />
        )}
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

export default OwnerCard;
