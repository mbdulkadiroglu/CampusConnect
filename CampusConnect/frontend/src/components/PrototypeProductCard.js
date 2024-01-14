import * as React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"; // For an outlined heart
import FavoriteIcon from "@mui/icons-material/Favorite"; // For a filled heart

const ProductCard = ({ product, isFavorite, onToggleFavorite }) => {
  const [favorite, setFavorite] = React.useState(isFavorite);

  const handleFavoriteClick = () => {
    setFavorite(!favorite);
    onToggleFavorite(product.id, !favorite);
  };

  return (
    <Card
      sx={{
        maxWidth: 300,
        position: "relative",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid rgb(127, 255, 0)",
        margin: "20px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        transition: "transform 0.1s ease-in-out",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={product.imageUrl}
          alt={product.name}
          sx={{
            width: "100%",
            aspectRatio: "1",
            objectFit: "contain",
          }}
        />
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Changed to darker background for the icon
            borderRadius: "50%",
            transition: "background-color 0.2s",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.8)", // Darker on hover for better contrast
            },
          }}
          onClick={handleFavoriteClick}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          {favorite ? (
            <FavoriteIcon sx={{ color: "red" }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: "white" }} />
          )}
        </IconButton>
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          bgcolor: "rgba(0, 0, 0, 0.5)", // Black with transparency
          textAlign: "center",
        }}
      >
        <CardContent
          sx={{
            padding: "5px",
            "&:last-child": { paddingBottom: "5px" }, // Override for last-child
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            sx={{
              color: "white",
              fontSize: "1.2rem",
              paddingBottom: "0px",
            }}
          >
            {product.name}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              color: "rgb(127, 255, 0)",
              fontSize: "1.1rem",
              paddingBottom: "0px",
              fontWeight: "bold",
            }}
          >
            {product.price}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
};

export default ProductCard;
