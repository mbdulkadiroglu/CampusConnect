const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const departments = ["","CS", "EE", "ME", "IE","CTIS","CHEM", "PHYS","MATH","MBG","THM","ARCH","COMD","FA", "GRA","IAED","LAUD","MAN","ECON", "HIST", "IR","POLS","PSYC","AMER", "HART", "ELIT", "MUS"];
const threeDays = 3 * 24 * 60 * 60 * 1000;

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  memberType: {
    type: String,
    enum: ["Student", "Faculty", "Staff"],
    required: true,
  },
  department: {
    type: String,
    enum: departments,
    required: function () {
      return this.memberType !== "Staff"; // Required only if memberType is not "Staff"
    },
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

  profileImage: { type: String, required: false }, // URL to the image

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
});


userSchema.statics.register = async function (
  email,
  password,
  firstName,
  lastName,
  memberType,
  department
) {
  if (!email || !password || !firstName || !lastName || !memberType) {
    throw new Error("All fields must be filled");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Invalid email");
  }

  //check if email ends with bilkent.edu.tr
  if (!email.endsWith("bilkent.edu.tr")) {
    throw new Error("Not a Bilkent email");
  }

  const existingUser = await this.findOne({ email });
  if (existingUser) {
    if (!existingUser.isVerified) {
      if (existingUser.createdAt < Date.now() - threeDays) {
        await this.deleteOne({ email });
      }
      else {
        throw new Error("Please verify the account from your email");
      }
    }
    else {
      throw new Error("Email already in use");
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({
    email,
    password: hash,
    firstName,
    lastName,
    memberType,
    department,
    isVerified: false,
    isAdmin: false
  });

  return user;
};

userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw new Error("All fields must be filled");
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw new Error("Incorrect Email");
  }

  if (!user.isVerified) {
    throw new Error("Please verify your email");
  }

  if(user.isBanned) {
    throw new Error("You have been banned from CampusConnect! Mail us through campusconnect-honeybadgers@gmail.com for unban request.");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Incorrect Password");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);
