const express = require("express");
const multer = require("multer");

// controller functions
const {
  createPost,
  getPosts,
  getAllPosts,
  getPost,
  deletePost,
  updatePost,
  searchPosts,
} = require("../controllers/postController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

//fuzzy search route
router.get("/search/:type", searchPosts);

router.use(requireAuth);

const upload = multer({ dest: "uploads/" }); // temporarily save files to 'uploads/' folder

router.post("/create/:type", upload.array("images", 5), createPost);
// get post route
router.get("/:_id", getPost);

// get posts route
router.get("/all/:type", getPosts);

// get all posts route
router.get("/all", getAllPosts);

// delete post route
router.delete("/:_id", deletePost);

router.patch("/:_id", upload.array("images", 5), updatePost);

module.exports = router;
