const express = require("express");

// controller functions

const userController = require("../controllers/userController");
const User = require('../models/userModel');

const {
  loginUser,
  registerUser,
  getUser,
  getUserPosts,
  verifyUserEmail,
  resetPassword,
  updateUser,
  getUserFavorites, 
  isFavorite,
  changeFavorite
} = require("../controllers/userController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/login", loginUser);

router.post("/register", registerUser);

// verify user email
router.get("/verify/:token", verifyUserEmail);

// update user
router.patch("/:_id", requireAuth, updateUser);

// reset password
router.post("/reset-password", resetPassword);

router.post('/changeFavorite/:_id', requireAuth, changeFavorite);
router.get('/isFavorite/:postId', requireAuth, isFavorite);
router.get("/favorites", requireAuth, getUserFavorites); // Corrected

router.get("/posts", requireAuth, getUserPosts);

router.get("/:_id", requireAuth, getUser);
// update password
module.exports = router;
