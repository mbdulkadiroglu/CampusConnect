import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuthContext } from "../hooks/useAuthContext";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Modal from "../components/Modal";
import Update from "../pages/Update";

function ProductCard({
  post,
  onFavoriteChange,
  onUpdate,
  myProduct = false,
  isAdmin = false,
  onDelete,
  fetchAgain,
  setFetchAgain,
}) {
  const navigate = useNavigate();

  const { user } = useAuthContext();
  let [isFavorite, setIsFavorited] = useState(false);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`https://campusconnectbackend-67br.onrender.com/api/user/isFavorite/${post._id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to check favorite status");
      }
      const data = await response.json();
      setIsFavorited(data.isFavorite);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  useEffect(() => {
    if (user && user.token) {
      checkFavoriteStatus();
    }
  }, [user, post._id]);

  const handleCardClick = () => {
    navigate(`/product/${post._id}`);
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();

    if (onDelete) {
      onDelete(event, post._id);
    }
  };
  const toggleFavorite = async (event) => {
    event.stopPropagation();

    setIsFavorited(!isFavorite);

    try {
      const endpoint = `https://campusconnectbackend-67br.onrender.com/api/user/changeFavorite/${post._id}`;
      const method = "POST"; // Change to POST as DELETE requests typically do not contain a body

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ postId: post._id }),
      });

      if (!response.ok) {
        setIsFavorited(isFavorite);
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }

      onFavoriteChange(`Favorite status changed for ${post.title}`, "success");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      onFavoriteChange("Failed to change favorite status", "error");
    }
  };

  const getStatusStyles = () => {
    switch (post.postType) {
      case "SecondHandSalePost":
        return {
          borderColor: "#3D7C7E",
          label: `${post.price} TL`,
          labelBg: "#3D7C7E",
          labelColor: "white",
        };
      case "LostAndFoundPost":
        const status = post.status;
        return {
          borderColor: status === "lost" ? "#A53333" : "#33A578",
          label: status === "lost" ? "Lost" : "Found",
          labelBg: status === "lost" ? "#A53333" : "#33A578",
          labelColor: "white",
        };
      case "DonationPost":
        return {
          borderColor: "#257494",
          label: "Donation",
          labelBg: "#257494",
          labelColor: "white",
        };
      case "BorrowPost":
        return {
          borderColor: "#831A6C",
          label: `Borrow for ${post.duration} day(s)`,
          labelBg: "#831A6C",
          labelColor: "white",
        };
      case "FlatDormMatePost":
        const category = post.category;
        return {
          borderColor: "#DE3590",
          label:
            category === "accommodation"
              ? `Rent ${post.rent} TL`
              : post.budget === 0 ? `Looking for a dorm room` : `Budget ${post.budget} TL`,
          labelBg: "#DE3590",
          labelColor: "white",
        };
      default:
        return {
          borderColor: "orange",
          label: `${post.price} TL`,
          labelBg: "orange",
          labelColor: "white",
        };
    }
  };

  const { borderColor, label, labelBg, labelColor } = getStatusStyles();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const handleEditClick = (event) => {
    event.stopPropagation();
    setIsUpdateModalOpen(true);
  };

  return (
    <div>
      <Card
        onClick={handleCardClick}
        sx={{
          width: 260,
          height: myProduct || isAdmin ? 470 : 380,
          border: `1px solid ${borderColor}`,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          position: "relative", // Added for absolute positioning of child components
        }}
      >
        {label && myProduct && (
          <Box
            sx={{
              backgroundColor: labelBg,
              color: labelColor,
              px: 1,
              py: 0.5,
              mb: 1,
              textAlign: "center",
            }}
          >
            {post.postType}
          </Box>
        )}
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="170"
            image={
              post.images[0] ||
              "https://dummyimage.com/600x400/000/fff&text=No+img"
            }
            alt="Product Name"
            sx={{
              width: "calc(100% - 24px)",
              margin: "12px 12px 0px 12px",
              alignSelf: "center",
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, overflow: "hidden" }}>
          {
            <IconButton onClick={toggleFavorite} aria-label="add to favorites">
              {isFavorite ? (
                <FavoriteIcon style={{ color: "red" }} />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
          }
          {label && (
            <Box
              sx={{
                backgroundColor: labelBg,
                color: labelColor,
                borderRadius: 1,
                px: 1,
                py: 0.5,
                mb: 1,
                textAlign: "center",
              }}
            >
              {label}
            </Box>
          )}
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {post.category !== "roommate" ? post.title : post.publisherName}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mb: myProduct ? 1 : 2,
              fontSize: "0.9rem",
            }}
          >
            {post.description}
          </Typography>
          {myProduct && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0.1, // Position at the bottom of the card
                right: 0.2,
                width: "100%", // Make the box as wide as the card
                display: "flex",
                justifyContent: "flex-end",
                p: 1,
                backgroundColor: "background.paper", // Optional: for a distinct separation
              }}
            >
              <IconButton
                aria-label="edit product"
                style={{ color: "blue" }}
                onClick={handleEditClick}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                aria-label="remove product"
                style={{ color: "red" }}
                onClick={handleDeleteClick}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
          {isAdmin && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0.1, // Position at the bottom of the card
                right: 0.2,
                width: "100%", // Make the box as wide as the card
                display: "flex",
                justifyContent: "flex-end",
                p: 1,
                backgroundColor: "background.paper", // Optional: for a distinct separation
              }}
            >
              <IconButton
                aria-label="remove product"
                style={{ color: "red" }}
                onClick={handleDeleteClick}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </CardContent>
      </Card>
      {isUpdateModalOpen && (
        <Modal onClose={() => setIsUpdateModalOpen(false)}>
          <Update
            post={post}
            onClose={() => setIsUpdateModalOpen(false)}
            onUpdate={onUpdate}
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
          />
        </Modal>
      )}
    </div>
  );
}

export default ProductCard;
