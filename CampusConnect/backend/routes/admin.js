const express = require("express");

const {
    getAllPosts,
    getAllUsers,
    deleteUser,
    banUser,
    unbanUser,
    getUnbannedUsers
} = require("../controllers/adminController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

// get all posts
router.get("/allPosts", getAllPosts);

// get all users
router.get("/allUsers", getAllUsers);

// get unbanned users
router.get("/unbannedUsers", getUnbannedUsers);

// delete user
router.delete("/:_id", deleteUser);

// ban and unban users
router.patch('/banUser/:id', banUser);
router.patch('/unbanUser/:id', unbanUser);

module.exports = router;