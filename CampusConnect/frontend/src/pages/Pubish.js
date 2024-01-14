import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import {
  Button,
  TextField,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Grid,
  Autocomplete,
} from "@mui/material";
import ClipLoader from "react-spinners/ClipLoader";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CloseIcon from "@mui/icons-material/Close";
import { usePublish } from "../hooks/usePublish";
import { useNavigate } from "react-router-dom";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const mapContainerStyle = {
  height: "400px",
  width: "100%",
};
const libraries = ["places"];

export default function Publish() {
  const { user } = useAuthContext();
  const prevlocation = useLocation();
  const passedString = prevlocation.state?.postType;
  console.log("passedString", passedString);
  const [type, setType] = useState(passedString);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("lost");
  const { publishProduct, isLoading, error } = usePublish(type);
  const categories = ["Book", "Electronics", "Clothing", "Other"];
  const navigate = useNavigate();

  // New state variables for flat/dorm mate
  const [location, setLocation] = useState({ lat: 39.871221, lng: 32.749995 }); // Default location
  const [rent, setRent] = useState("");
  const [noSmoking, setNoSmoking] = useState(false);
  const [noPets, setNoPets] = useState(false);
  const [mode, setMode] = useState("offer"); // or "find"
  const searchBoxRef = useRef(null);
  const [budget, setBudget] = useState("");
  const prevMode = useRef(mode);

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    // Check if transitioning away from "find" mode in "FlatDormMatePost"
    if (
      prevMode.current === "find" &&
      mode !== "find" &&
      type === "FlatDormMatePost"
    ) {
      setTitle(""); // Clear title only on transitioning away from "find" mode
    } else if (type === "FlatDormMatePost" && mode === "find") {
      setTitle(`${user.firstName} ${user.lastName}`);
    }
    prevMode.current = mode; // Update previous mode
  }, [type, mode, user.name]); // Depend on type, mode, and user.name

  const handleImageChange = (event) => {
    const newImages = Array.from(event.target.files);
    const updatedImages = [...images, ...newImages].slice(0, 5);
    setImages(updatedImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleDeleteImage = (indexToDelete) => {
    const updatedImages = images.filter((_, index) => index !== indexToDelete);
    setImages(updatedImages);

    const updatedPreviews = imagePreviews.filter(
      (_, index) => index !== indexToDelete
    );
    setImagePreviews(updatedPreviews);
  };

  const handleKeyPressOnSearchBox = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  const onPlacesChanged = useCallback(() => {
    try {
      if (searchBoxRef.current) {
        const places = searchBoxRef.current.getPlaces();
        if (places && places.length > 0) {
          const place = places[0];
          setLocation({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    formData.append("type", type);

    formData.append("title", title);
    formData.append("description", description);

    if (type === "SecondHandSalePost") {
      formData.append("price", price);
    } else if (type === "BorrowPost") {
      formData.append("duration", duration);
    } else if (type === "LostAndFoundPost") {
      formData.append("status", status);
    }

    if (type === "FlatDormMatePost") {
      formData.append(
        "category",
        mode === "offer" ? "accommodation" : "roommate"
      );
      formData.append("lat", location.lat);
      formData.append("lng", location.lng);
      formData.append("rent", rent);
      formData.append("noSmoking", noSmoking);
      formData.append("noPets", noPets);
      formData.append("budget", budget);
    } else {
      formData.append("category", category);
    }

    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const result = await publishProduct(formData);
      if (result.success) {
        navigate("/profile");
      } else {
        console.error("Failed to publish:", result.error);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}
    >
      <div>
        <label>Publish In:</label>
        <select
          style={{
            width: "100%",
            height: "35px",
            marginTop: "8px",
            marginBottom: "16px",
          }}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="SecondHandSalePost">SECOND-HAND SALE</option>
          <option value="LostAndFoundPost">LOST AND FOUND</option>
          <option value="DonationPost">DONATION</option>
          <option value="BorrowPost">BORROW</option>
          <option value="FlatDormMatePost">FLAT/DORM MATE</option>
        </select>
      </div>

      {type !== "FlatDormMatePost" ? (
        <>
          <Autocomplete
            id="category-combo-box"
            options={categories}
            getOptionLabel={(option) => option}
            fullWidth
            value={category}
            onChange={(event, newValue) => setCategory(newValue)}
            renderInput={(params) => <TextField {...params} label="Category" />}
          />
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            minRows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {type === "LostAndFoundPost" && (
            <Autocomplete
              id="status-combo-box"
              options={["lost", "found"]}
              getOptionLabel={(option) => option}
              fullWidth
              margin="16px 0 0 0"
              value={status}
              onChange={(event, newValue) => setStatus(newValue)}
              renderInput={(params) => <TextField {...params} label="Status" />}
            />
          )}
          {type === "SecondHandSalePost" && (
            <TextField
              fullWidth
              label="Price"
              margin="normal"
              InputProps={{ endAdornment: "TL" }}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          )}
          {type === "BorrowPost" && (
            <TextField
              fullWidth
              label="Duration"
              margin="normal"
              InputProps={{ endAdornment: "Days" }}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          )}
          <div style={{ marginTop: "20px" }}>
            <Grid
              container
              spacing={2}
              style={{ justifyContent: "space-between" }}
            >
              {[...Array(5)].map((_, index) => (
                <Grid item style={{ width: "calc(20% - 10px)" }} key={index}>
                  <div style={{ paddingTop: "100%", position: "relative" }}>
                    {imagePreviews[index] && (
                      <Button
                        style={{
                          position: "absolute",
                          color: "white",
                          top: 2,
                          right: 2,
                          minWidth: 0,
                          minHeight: 0,
                          padding: "6px",
                          margin: "2px",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          borderRadius: "50%",
                          zIndex: 2,
                        }}
                        onClick={() => handleDeleteImage(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      component="label"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        aspectRatio: "1",
                        height: "100%",
                        border: "1px dashed grey",
                        borderRadius: "10px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "0",
                      }}
                    >
                      {imagePreviews[index] ? (
                        <img
                          src={imagePreviews[index]}
                          alt={`Preview ${index}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                        />
                      ) : (
                        <AddAPhotoIcon style={{ marginBottom: "5px" }} />
                      )}
                      <input
                        type="file"
                        hidden
                        multiple
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </Button>
                  </div>
                </Grid>
              ))}
            </Grid>
          </div>{" "}
        </>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            I want to...
          </Typography>
          <ToggleButtonGroup
            color="primary"
            value={mode}
            exclusive
            onChange={handleModeChange}
            sx={{ marginBottom: 2 }}
          >
            <ToggleButton value="find">Find Accommodation</ToggleButton>
            <ToggleButton value="offer">Offer Accommodation</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={type === "FlatDormMatePost" && mode === "find"}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            minRows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Preferences */}
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Preferences
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={noSmoking}
                  onChange={(e) => setNoSmoking(e.target.checked)}
                />
              }
              label="No Smoking"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={noPets}
                  onChange={(e) => setNoPets(e.target.checked)}
                />
              }
              label="No Pets"
            />
          </Box>

          {mode === "offer" && (
            <>
              <TextField
                fullWidth
                label="Rent"
                margin="normal"
                type="number"
                InputProps={{ endAdornment: "TL" }}
                value={rent}
                onChange={(e) => setRent(e.target.value)}
              />

              {/* Location Search and Map */}
              <Typography variant="h6" sx={{ mt: 2 }}>
                Location
              </Typography>
              <LoadScript
                googleMapsApiKey="AIzaSyAjslK-SsAzhdHz_xyegelQD-Oi7mcPeSc"
                libraries={libraries}
                language="en"
              >
                <Box>
                  <StandaloneSearchBox
                    onLoad={(ref) => (searchBoxRef.current = ref)}
                    onPlacesChanged={onPlacesChanged}
                  >
                    <TextField
                      fullWidth
                      label="Search Location"
                      margin="normal"
                      onKeyDown={handleKeyPressOnSearchBox}
                    />
                  </StandaloneSearchBox>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={location}
                    zoom={15}
                    onClick={(e) =>
                      setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() })
                    }
                  >
                    <Marker position={location} />
                  </GoogleMap>
                </Box>
              </LoadScript>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Photos
              </Typography>
              <div style={{ marginTop: "10px" }}>
                <Grid
                  container
                  spacing={2}
                  style={{ justifyContent: "space-between" }}
                >
                  {[...Array(5)].map((_, index) => (
                    <Grid
                      item
                      style={{ width: "calc(20% - 10px)" }}
                      key={index}
                    >
                      <div style={{ paddingTop: "100%", position: "relative" }}>
                        {imagePreviews[index] && (
                          <Button
                            style={{
                              position: "absolute",
                              color: "white",
                              top: 2,
                              right: 2,
                              minWidth: 0,
                              minHeight: 0,
                              padding: "6px",
                              margin: "2px",
                              backgroundColor: "rgba(0, 0, 0, 0.5)",
                              borderRadius: "50%",
                              zIndex: 2,
                            }}
                            onClick={() => handleDeleteImage(index)}
                          >
                            <CloseIcon fontSize="small" />
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          component="label"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            aspectRatio: "1",
                            height: "100%",
                            border: "1px dashed grey",
                            borderRadius: "10px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "0",
                          }}
                        >
                          {imagePreviews[index] ? (
                            <img
                              src={imagePreviews[index]}
                              alt={`Preview ${index}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "10px",
                              }}
                            />
                          ) : (
                            <AddAPhotoIcon style={{ marginBottom: "5px" }} />
                          )}
                          <input
                            type="file"
                            hidden
                            multiple
                            onChange={handleImageChange}
                            accept="image/*"
                          />
                        </Button>
                      </div>
                    </Grid>
                  ))}
                </Grid>
              </div>
            </>
          )}
          {mode !== "offer" && (
            <>
              <TextField
                fullWidth
                label="Budget (enter 0 if you are looking for a dorm room)"
                margin="normal"
                type="number"
                InputProps={{ endAdornment: "TL" }}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </>
          )}
        </>
      )}

      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: "20px", width: "100%" }}
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <ClipLoader
            color={"#ffffff"}
            loading={isLoading}
            size={20}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        ) : (
          "Publish"
        )}
      </Button>
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
    </Box>
  );
}
