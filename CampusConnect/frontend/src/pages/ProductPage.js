import React from "react";
import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  IconButton,
  CircularProgress,
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Navigate, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { ImageSlider } from "../components/ImageSlider";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import TextField from "@mui/material/TextField";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

function ProductPage() {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState({});
  const [publisher, setPublisher] = useState({});
  const { user } = useAuthContext();
  const [pageLoading, setPageLoading] = useState(false);
  const [messageToSeller, setMessageToSeller] = useState("");

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(
        `https://campusconnectbackend-67br.onrender.com/api/user/isFavorite/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check favorite status");
      }
      const data = await response.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };
  useEffect(() => {
    if (user && user.token) {
      checkFavoriteStatus();
    }
  }, [user, productId]);

  useEffect(() => {
    const fetchProduct = async () => {
      setPageLoading(true); // Start page loading
      try {
        // Fetch product details
        const productResponse = await fetch(
          `https://campusconnectbackend-67br.onrender.com/api/post/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const productJson = await productResponse.json();
        console.log(productJson);
        if (productResponse.ok) {
          setProduct(productJson.post || {});
          // Fetch publisher details if product has a publisher
          if (productJson.post.publisher) {
            const publisherResponse = await fetch(
              `https://campusconnectbackend-67br.onrender.com/api/user/${productJson.post.publisher}`,
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              }
            );
            const publisherJson = await publisherResponse.json();
            setPublisher(publisherJson.user || {});
          }
          // Check favorite status
          const favoriteResponse = await fetch(
            `https://campusconnectbackend-67br.onrender.com/api/user/isFavorite/${productId}`,
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          const favoriteJson = await favoriteResponse.json();
          setIsFavorite(favoriteJson.isFavorite);
        } else {
          // Handle errors, e.g., product not found
          navigate("/not-found"); // Redirect to a not-found page or show an error message
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setPageLoading(false); // End page loading
      }
    };

    if (user && user.token) {
      fetchProduct();
    }
  }, [productId, user, navigate]);

  const toggleFavorite = async () => {
    // Optimistically set the favorite state
    setIsFavorite((current) => !current);

    try {
      const method = "POST"; // Adjust the method based on current favorite status

      const response = await fetch(
        `https://campusconnectbackend-67br.onrender.com/api/user/changeFavorite/${productId}`,
        {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ postId: productId }),
        }
      );

      if (!response.ok) {
        // If the request fails, revert the optimistic update
        setIsFavorite((current) => !current);
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }

      // You can fetch the new favorite list here if needed
      // or handle the state update depending on your backend response
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };
  const sendStartMessage = async (startMessage, selectedChat) => {
    if (!startMessage.trim()) return; // Prevent sending empty messages

    console.log("Start Message", startMessage);
    try {
      const response = await fetch(
        "https://campusconnectbackend-67br.onrender.com/api/chat/messages/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            content: startMessage,
            chat: selectedChat,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Update the frontend with the new message (optional, depends on your implementation)
      const newMessage = await response.json();

      console.log(response);
      console.log("New Mes", newMessage);

      //socket.emit("new message", newMessage);
      //setMessages([...messages, newMessage]);

      setMessageToSeller(""); // Clear the message input field after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const chatWithSeller = () => {
    if (!messageToSeller.trim()) {
      alert("First message can not be empty");
      return;
    }
    const createChat = async () => {
      try {
        const response = await fetch(
          "https://campusconnectbackend-67br.onrender.com/api/chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              targetUserId: publisher._id,
              topicPostId: product._id,
            }),
          }
        );
        console.log(response);
        if (!response.ok) {
          // You can also handle different status codes differently if needed
          const errorResponse = await response.json();
          const errorMessage =
            errorResponse.error || "An unknown error occurred";
          throw new Error(errorMessage);
        }

        const chatJson = await response.json();
        console.log("Chat:", chatJson);
        console.log("Message", messageToSeller);
        await sendStartMessage(messageToSeller, chatJson.chat._id);
        // Navigate to messages if successful
        navigate("/messages", {
          state: {
            selectedChatId: chatJson.chat._id,
            startMessage: messageToSeller,
          },
        });
      } catch (error) {
        console.error("Failed to create chat:", error);
        // Display the error to the user
        alert(error.message);
      }
    };
    createChat();
  };

  const getProductType = (type) => {
    switch (type) {
      case "SecondHandSalePost":
        return `${product.price} TL`;
      case "LostAndFoundPost":
        return product.status === "lost" ? "Lost" : "Found";
      case "DonationPost":
        return "Donation";
      case "BorrowPost":
        return "Borrow";
      case "FlatDormMatePost":
        return product.category;
      default:
        return "Unknown";
    }
  };

  if (pageLoading) {
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
    <Paper
      style={{
        width: "80%",
        margin: "auto",
        padding: "20px",
        marginTop: "25px",
      }}
    >
      {product &&
        publisher.firstName &&
        publisher.lastName &&
        product.postType && (
          <Grid container spacing={4}>
            {
              // Put the icon button right to the Typograpy variant h4 using same container or box or div
              // Product's title should appear under the h4 heading
            }
            <Grid item xs={8}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h4" gutterBottom>
                  {getProductType(product.postType)}
                </Typography>
                <IconButton
                  onClick={toggleFavorite}
                  aria-label="add to favorites"
                >
                  {isFavorite ? (
                    <FavoriteIcon style={{ color: "red", fontSize: "30px" }} />
                  ) : (
                    <FavoriteBorderIcon style={{ fontSize: "30px" }} />
                  )}
                </IconButton>
              </div>

              <Typography variant="h6" gutterBottom>
                {product.title}
              </Typography>
              <Divider style={{ margin: "20px 0" }} />

              <Paper style={{ height: "400px", background: "grey" }}>
                <ImageSlider images={product.images || []} />
              </Paper>
              <Divider style={{ margin: "20px 0" }} />

              <Typography variant="h5" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {product.description}
              </Typography>
            </Grid>

            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image="https://pbs.twimg.com/media/FthlD8jWwAEmMRg.jpg"
                      alt="Seller Image"
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        margin: "0 10px 10px 10px",
                      }}
                    />
                    <Typography variant="h6" gutterBottom>
                      {publisher.firstName + " " + publisher.lastName}
                    </Typography>
                  </div>

                  <TextField
                    fullWidth
                    label="Message to Post's Publisher"
                    variant="outlined"
                    margin="normal"
                    value={messageToSeller}
                    onChange={(e) => setMessageToSeller(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault(); // Prevents the default action of the enter key
                        chatWithSeller();
                      }
                    }}
                  />
                  <Button variant="outlined" fullWidth onClick={chatWithSeller}>
                    Message
                  </Button>

                  {product.postType === "FlatDormMatePost" &&
                    product.category === "accommodation" && (
                      <>
                        <Divider style={{ margin: "20px 0" }} />
                        <Typography variant="h6" sx={{ mt: 2, ml: 2 }}>
                          Location
                        </Typography>
                        <LoadScript
                          googleMapsApiKey="AIzaSyAjslK-SsAzhdHz_xyegelQD-Oi7mcPeSc"
                          language="en"
                        >
                          <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={{ lat: product.lat, lng: product.lng }}
                            zoom={13}
                          >
                            <Marker
                              position={{ lat: product.lat, lng: product.lng }}
                            />
                          </GoogleMap>
                        </LoadScript>
                      </>
                    )}
                  {product.postType === "FlatDormMatePost" && (
                    <>
                      <Divider style={{ margin: "20px 0" }} />
                      <Typography variant="body1" gutterBottom>
                        Preferences
                      </Typography>
                    </>
                  )}
                  {product.noSmoking === true && (
                    <Typography variant="body2" color="textSecondary">
                      No Smoking
                    </Typography>
                  )}
                  {product.noPets === true && (
                    <Typography variant="body2" color="textSecondary">
                      No Pets
                    </Typography>
                  )}
                  <Divider style={{ margin: "20px 0" }} />
                  <Typography variant="body1" gutterBottom>
                    Product Type
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {product.postType}
                  </Typography>

                  <Divider style={{ margin: "20px 0" }} />
                  <Typography variant="body1" gutterBottom>
                    Product Category
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {product.category}
                  </Typography>

                  <Divider style={{ margin: "20px 0" }} />
                  <Typography>Last Update Date</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(product.updatedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
    </Paper>
  );
}

export default ProductPage;
