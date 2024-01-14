const {Post} = require("../models/postModel");
const User = require("../models/userModel");

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find();

        res.status(200).json({ posts });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json({ users });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { _id } = req.params;
  
    try {
      const user = await User.findByIdAndDelete(_id);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.status(200).json({ user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  const banUser = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { isBanned: true },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user: updatedUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const unbanUser = async (req, res) => {
  const { id } = req.params;

  try {
      const updatedUser = await User.findByIdAndUpdate(
          id,
          { isBanned: false },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ user: updatedUser });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

const getUnbannedUsers = async (req, res) => {
  try {
      // Fetch users where the isBanned field is either false or does not exist
      const unbannedUsers = await User.find({ isBanned: { $ne: true } });
      res.status(200).json({ users: unbannedUsers });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
};

module.exports = {
    getAllPosts,
    getAllUsers,
    deleteUser,
    banUser,
    unbanUser,
    getUnbannedUsers,
};