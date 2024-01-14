import React from "react";
import { useState, useEffect } from "react";
import { Button, TextField, Grid, Autocomplete, Box } from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { useUpdate } from "../hooks/useUpdate";
import CloseIcon from "@mui/icons-material/Close";
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from "react-router-dom";

export default function Update({ post, onUpdate, onClose, fetchAgain, setFetchAgain }) {
    const type = post.postType; // paranthesis control_
    const [category, setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [duration, setDuration] = useState("");
    const [status, setStatus] = useState("");
    const [budget, setBudget] = useState("");
    const [rent, setRent] = useState("");
    const { updateProduct, isLoading, error } = useUpdate(post._id);
    const categories = ["Book", "Electronics", "Clothing", "Other"];
    const navigate = useNavigate();

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        // Initialize state with post data when the component mounts
        if (post) {
            setCategory(post.category || "");
            setTitle(post.title || "");
            setDescription(post.description || "");
            setPrice(post.price);
            setRent(post.rent);
            setBudget(post.budget);
            setDuration(post.duration || "");
            setStatus(post.status || "");
            console.log("post.images:", post.images);
            setImages(post.images || []);
            console.log("images (start):", images);
            // ... initialize other fields similarly ...
        }
    }, [post]);

    const handleImageChange = (event) => {
        const newImages = event ? Array.from(event.target.files) : [];
        console.log("images in handleChange:", images);
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        console.log("------Submit is calleddd-------");


        formData.append("type", type);
        formData.append("category", category);
        formData.append("title", title);
        formData.append("description", description);

        if (type === "SecondHandSalePost") {
            formData.append("price", price);
        } else if (type === "BorrowPost") {
            formData.append("duration", duration);
        } else if (type === "LostAndFoundPost") {
            formData.append("status", status);
        } else if (type === "FlatDormMatePost" && category === "roommate") {
            formData.append("budget", budget);
        } else if (type === "FlatDormMatePost" && category === "accommodation") {
            formData.append("rent", rent);
        }

        images.forEach((image) => {
            console.log("image BBBB:", image);
            formData.append("images", image);
        });
        console.log("FORM DATA");
        console.log(formData);
        console.log("FORM DATA END");
        try {
            const result = await updateProduct(formData);
            if (result.success) {
                setFetchAgain(!fetchAgain);
                onClose(); // Close the modal
                navigate("/profile");
                onUpdate(` ${post.title} successfully updated!`, 'success');
            } else {
                onUpdate('Failed to update', 'error');
                console.error("Failed to update:", result.error);
            }
        } catch (error) {
            console.error("Error in handleSubmit:", error);
        }
    };

    return (
        <Box
            style={{
                padding: "20px",
                maxWidth: "800px",
                margin: "0 auto",
                background: "white", // Set a background color
                position: "absolute",
                top: "50%", // Center vertically
                left: "50%", // Center horizontally
                transform: "translate(-50%, -50%)", // Adjust for centering
                boxShadow: "0 3px 10px rgba(0, 0, 0, 0.2)", // Optional shadow for pop-up effect
                borderRadius: "8px", // Optional rounded corners
            }}
        >
            <div style={{
                width: "100%",
                height: "35px",
                marginTop: "8px",
                marginBottom: "16px",
            }}>
                <label>Update Product:</label>
            </div>

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
                onChange={(e) => {
                    setTitle(e.target.value);
                }}
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
                //isOptionEqualToValue={(option, value) => option === value}
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

            {type === "FlatDormMatePost" && category === "roommate" &&(
                <TextField
                    fullWidth
                    label="Budget"
                    margin="normal"
                    InputProps={{ endAdornment: "TL" }}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                />
            )}

            {type === "FlatDormMatePost" && category === "accommodation" &&( 
                <TextField
                    fullWidth
                    label="Rent"
                    margin="normal"
                    InputProps={{ endAdornment: "TL" }}
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
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
                <Grid container spacing={2} style={{ justifyContent: "space-between" }}>
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
            </div>

            <Button
                variant="contained"
                color="primary"
                style={{ marginTop: "20px", width: "100%" }}
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit}
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
                    "Update"
                )}
            </Button>
            {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
        </Box>
    );
}