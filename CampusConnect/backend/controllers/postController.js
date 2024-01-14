const {
  Post,
  SecondHandSalePost,
  LostAndFoundPost,
  DonationPost,
  BorrowPost,
  FlatDormMatePost,
} = require("../models/postModel");
const User = require("../models/userModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createPost = async (req, res) => {
  const { type } = req.params;

  req.body.publisher = req.user._id;

  try {
    let post;
    switch (type) {
      case "SecondHandSalePost":
        post = await SecondHandSalePost.createSecondHandSalePost(
          req.body,
          req.files
        );
        break;
      case "LostAndFoundPost":
        post = await LostAndFoundPost.createLostAndFoundPost(
          req.body,
          req.files
        );
        break;
      case "DonationPost":
        post = await DonationPost.createDonationPost(req.body, req.files);
        break;
      case "BorrowPost":
        post = await BorrowPost.createBorrowPost(req.body, req.files);
        break;
      case "FlatDormMatePost":
        post = await FlatDormMatePost.createFlatDormMatePost(
          req.body,
          req.files
        );
        break;
      default:
        throw new Error("Invalid post type.");
    }

    res.status(200).json({ post });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPost = async (req, res) => {
  const { _id } = req.params;

  try {
    const post = await Post.findById(_id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json({ post });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPosts = async (req, res) => {
  const { type } = req.params;

  try {
    let posts;
    switch (type) {
      case "SecondHandSalePost":
        posts = await SecondHandSalePost.find().sort({ createdAt: -1 });
        break;
      case "LostAndFoundPost":
        posts = await LostAndFoundPost.find().sort({ createdAt: -1 });
        break;
      case "DonationPost":
        posts = await DonationPost.find().sort({ createdAt: -1 });
        break;
      case "BorrowPost":
        posts = await BorrowPost.find().sort({ createdAt: -1 });
        break;
      case "FlatDormMatePost":
        posts = await FlatDormMatePost.find().sort({ createdAt: -1 });
        break;
      default:
        throw new Error("Invalid post type.");
    }

    res.status(200).json({ posts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();

    res.status(200).json({ posts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deletePost = async (req, res) => {
  const { _id } = req.params;
  console.log("HERE");
  console.log("id", _id);

  try {
    const post = await Post.findByIdAndDelete(_id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    User.updateOne({ _id: post.publisher }, { $pull: { posts: _id } });

    res.status(200).json({ post });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const searchPosts = async (req, res) => {
  const { type } = req.params;
  const { searchTerm, category, sort } = req.query;

  let aggregationPipeline = [];
  let sortOption = {};

  if (searchTerm) {
    aggregationPipeline.push({
      $search: {
        index: "default",
        text: {
          query: searchTerm,
          path: "title",
          fuzzy: {
            maxEdits: 1,
          },
        },
      },
    });
  }

  const matchCondition = { postType: type };
  if (category && category !== "null") {
    matchCondition.category = category;
  }
  aggregationPipeline.push({ $match: matchCondition });

  switch (sort) {
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "priceLowToHigh":
      sortOption = { price: 1 };
      break;
    case "priceHighToLow":
      sortOption = { price: -1 };
      break;
    default:
      sortOption = {};
  }

  if (Object.keys(sortOption).length) {
    aggregationPipeline.push({ $sort: sortOption });
  }

  console.log(aggregationPipeline);

  try {
    const posts = await SecondHandSalePost.aggregate(aggregationPipeline);
    res.status(200).json({ posts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updatePost = async (req, res) => {
  const { _id } = req.params;
  existingImages = req.body.images;
  imageFiles = req.files;

  try {
    // First, find the post by ID
    let post = await Post.findById(_id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Update common fields
    post.title = req.body.title || post.title;
    post.description = req.body.description || post.description;
    post.isActive = req.body.isActive || post.isActive;
    post.publisher = req.body.publisher || post.publisher;
    post.category = req.body.category || post.category;
    post.images = existingImages;
    // ... handle other common fields ...

    // Handle specific fields based on post type
    if (post.postType === "SecondHandSalePost") {
      post.price = req.body.price || post.price;
    }
    if (post.postType === "LostAndFoundPost") {
      post.status = req.body.status || post.status;
    }
    if (post.postType === "BorrowPost") {
      if(req.body.duration <= 365){
        post.duration = req.body.duration || post.duration;
      }
      else{
        return res.status(400).json({ error: "Borrow duration cannot be more than 365 days!" });
      }
    }
    if(post.postType === "FlatDormMatePost"){
      if(post.category === "roommate"){
        post.budget = req.body.budget || post.budget;
      }
      else if(post.category === "accommodation"){
        post.rent = req.body.rent || post.rent;
      }
    }
    // Repeat for other post types

    let imageUrls = [];
    if (imageFiles && imageFiles.length > 0) {
      imageUrls = await Promise.all(
        imageFiles.map((file) => cloudinary.uploader.upload(file.path))
      ).then((results) => results.map((result) => result.secure_url));
      post.images = imageUrls;
    }

    // Save the updated document
    await post.save();

    res.status(200).json({ post });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createPost,
  getPost,
  getPosts,
  getAllPosts,
  deletePost,
  searchPosts,
  updatePost,
};
