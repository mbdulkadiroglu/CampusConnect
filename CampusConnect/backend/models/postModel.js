const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./userModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    publisher: { type: Schema.Types.ObjectId, ref: "User" },
    category: { type: String, required: true },
    images: [{ type: String, required: true }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { discriminatorKey: "postType" }
);

const Post = mongoose.model("Post", postSchema);

const SecondHandSalePostSchema = new Schema({
  price: { type: Number, required: true },
});

SecondHandSalePostSchema.statics.createSecondHandSalePost = async function (
  data,
  imageFiles
) {
  validateCommonFields(data);
  if (!data.price) {
    throw new Error("Price is required for SecondHandSalePost.");
  }
  if (data.price <= 0) {
    throw new Error("Price cannot be less than or equal to 0 (zero)!");
  }

  if (!imageFiles || imageFiles.length === 0) {
    throw new Error("At least one image is required");
  }

  let imageUrls = [];
  if (imageFiles && imageFiles.length > 0) {
    imageUrls = await Promise.all(
      imageFiles.map((file) => cloudinary.uploader.upload(file.path))
    ).then((results) => results.map((result) => result.secure_url));
  }

  data.images = imageUrls;

  // Create the post with images
  const post = await this.create(data);

  // Add post to user's posts
  await User.findByIdAndUpdate(data.publisher, {
    $push: { posts: post._id },
  });

  return post;
};

const SecondHandSalePost = Post.discriminator(
  "SecondHandSalePost",
  SecondHandSalePostSchema
);

const LostAndFoundPostSchema = new Schema({
  images: [{ type: String, required: false }],
  status: {
    type: String,
    enum: ["lost", "found"],
    required: true,
  },
});

LostAndFoundPostSchema.statics.createLostAndFoundPost = async function (
  data,
  imageFiles
) {
  validateCommonFields(data);

  if (!data.status) {
    throw new Error("Status is required for Lost and Found Post.");
  }

  if (!imageFiles || imageFiles.length === 0) {
    throw new Error("At least one image is required");
  }

  let imageUrls = [];
  if (imageFiles && imageFiles.length > 0) {
    imageUrls = await Promise.all(
      imageFiles.map((file) => cloudinary.uploader.upload(file.path))
    ).then((results) => results.map((result) => result.secure_url));
  }

  data.images = imageUrls;

  const post = await this.create(data);

  // Add post to user's posts
  await User.findByIdAndUpdate(data.publisher, {
    $push: { posts: post._id },
  });

  return post;
};

const LostAndFoundPost = Post.discriminator(
  "LostAndFoundPost",
  LostAndFoundPostSchema
);

const DonationPostSchema = new Schema();

DonationPostSchema.statics.createDonationPost = async function (
  data,
  imageFiles
) {
  validateCommonFields(data);

  if (!imageFiles || imageFiles.length === 0) {
    throw new Error("At least one image is required");
  }

  let imageUrls = [];
  if (imageFiles && imageFiles.length > 0) {
    imageUrls = await Promise.all(
      imageFiles.map((file) => cloudinary.uploader.upload(file.path))
    ).then((results) => results.map((result) => result.secure_url));
  }

  data.images = imageUrls;

  const post = await this.create(data);

  // Add post to user's posts
  await User.findByIdAndUpdate(data.publisher, {
    $push: { posts: post._id },
  });

  return post;
};

const DonationPost = Post.discriminator("DonationPost", DonationPostSchema);

const BorrowPostSchema = new Schema({
  images: [{ type: String, required: false }],
  duration: { type: String, required: true },
});

BorrowPostSchema.statics.createBorrowPost = async function (data, imageFiles) {
  validateCommonFields(data);

  if (!data.duration) {
    throw new Error("Duration is required for BorrowPost.");
  }

  if (!imageFiles || imageFiles.length === 0) {
    throw new Error("At least one image is required");
  }

  let imageUrls = [];
  if (imageFiles && imageFiles.length > 0) {
    imageUrls = await Promise.all(
      imageFiles.map((file) => cloudinary.uploader.upload(file.path))
    ).then((results) => results.map((result) => result.secure_url));
  }

  data.images = imageUrls;

  const post = await this.create(data);

  // Add post to user's posts
  await User.findByIdAndUpdate(data.publisher, {
    $push: { posts: post._id },
  });

  return post;
};

const BorrowPost = Post.discriminator("BorrowPost", BorrowPostSchema);

function validateCommonFields(data) {
  if (!data.title) {
    throw new Error("Title is required.");
  }
  if (!data.description) {
    throw new Error("Description is required.");
  }
  if (!data.publisher) {
    throw new Error("Publisher is required.");
  }
  if (!data.category) {
    throw new Error("Category is required.");
  }
}

const FlatDormMatePostSchema = new Schema({
  publisherName: {
    type: String,
    required: false,
  },
  lat: {
    type: Number,
    required: false,
  },
  lng: {
    type: Number,
    required: false,
  },
  rent: {
    type: Number,
    required: false,
  },
  budget: {
    type: Number,
    required: false,
  },
  noSmoking: {
    type: Boolean,
    required: false,
  },
  noPets: { type: Boolean, required: false },
});

FlatDormMatePostSchema.statics.createFlatDormMatePost = async function (
  data,
  imageFiles
) {
  validateCommonFields(data);
  let imageUrls = [];
  if (imageFiles && imageFiles.length > 0) {
    imageUrls = await Promise.all(
      imageFiles.map((file) => cloudinary.uploader.upload(file.path))
    ).then((results) => results.map((result) => result.secure_url));
  }

  if (data.category === "roommate") {
    if (!data.budget) {
      throw new Error("Budget is required.");
    }
    if (data.budget < 0) {
      throw new Error("Budget cannot be less than 0 (zero)!");
    }
  }
  if (data.category === "accommodation") {
    if (!data.rent) {
      throw new Error("Rent is required.");
    }
    if (data.rent < 0) {
      throw new Error("Rent cannot be less than 0 (zero)!");
    }
  }

  data.images = imageUrls;

  //get publisher name
  const publisher = await User.findById(data.publisher);
  data.publisherName = publisher.firstName + " " + publisher.lastName;

  console.log(data);

  const post = await this.create(data);

  // Add post to user's posts
  await User.findByIdAndUpdate(data.publisher, {
    $push: { posts: post._id },
  });

  return post;
};

const FlatDormMatePost = Post.discriminator(
  "FlatDormMatePost",
  FlatDormMatePostSchema
);

module.exports = {
  Post,
  SecondHandSalePost,
  LostAndFoundPost,
  DonationPost,
  BorrowPost,
  FlatDormMatePost,
};
