const { sendEmail } = require('../services/email');
const User = require("../models/userModel");
const Post = require("../models/postModel"); 
const jwt = require("jsonwebtoken");
const { generatePassword } = require("../services/password");
const bcrypt = require("bcrypt");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" }); // 3 days
};


// login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    const token = createToken(user._id);

    res.status(200).json({
      email,
      firstName: user.firstName,
      lastName: user.lastName,
      memberType: user.memberType,
      department: user.department,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const updateUser = async (req, res) => {
  const { _id } = req.user; 
  const { firstName, lastName, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Old password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



const registerUser = async (req, res) => {
  const { email, password, firstName, lastName, memberType, department } =
    req.body;

  try {
    const user = await User.register(
      email,
      password,
      firstName,
      lastName,
      memberType,
      department
    );

    const token = createToken(user._id);

    mail_content = `Welcome aboard!

We are pleased to have you in CampusConnect! To verify your email, please click the following link: https://campusconnect-honeybadgers.netlify.app/verify/${token}
    
The link will expire in 3 days, don't wait up!
    
If you did not recently register for CampusConnect, please ignore this email.`

    sendEmail(to_address=email, subject="CampusConnect E-mail Verification", content=mail_content).catch((error) => {
      res.status(400).json({ error: error.message });
    });

    res.status(200).json({ email, message: "Registration successful. Please check your email for verification." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  const { _id } = req.params;

  try {
    const user = await User.findById(_id).select("-password"); 
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserPosts = async (req, res) => {
  console.log(req.user);
  const _id = req.user._id;

  try {
    const user = await User.findById(_id).populate({
      path: "posts",
      options: { sort: { _id: -1 } },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ posts: user.posts });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const getUserFavorites = async (req, res) => {
  console.log(req.user);
  const _id = req.user._id;

  try {
    const user = await User.findById(_id).populate({
      path: "favorites",
      options: { sort: { _id: -1 } },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ favorites: user.favorites});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const isFavorite = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const favoriteStatus = user.favorites.includes(postId);
    res.status(200).json({ isFavorite: favoriteStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a favorite
// const removeFavorite = async (req, res) => {
//   const { _id } = req.params;
//   const userId = req.user._id;

//   try {
//     const user = await User.findById(userId);
//     console.log(_id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     if (!user.favorites.includes(_id)) {
//         user.favorites.push(_id);
//         await user.save();
//     }

//     user.favorites.pull(_id);
//     await user.save();

//     res.status(200).json({ message: 'Favorite removed' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// Add a favorite
const changeFavorite = async (req, res) => {
  const { _id } = req.params;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.favorites.includes(_id)) {
      console.log("Already in favorites DELETING");
      user.favorites.pull(_id);
      await user.save();
    }
    else{
      console.log("NOT in favorites ADDING");
      user.favorites.push(_id);
      await user.save(); 
    }

    console.log(  'Favorite changed!' );
    return res.status(200).json({message: "User is successfully found"});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// verify user email
const verifyUserEmail = async (req, res) => {
  const { token }  = req.params;

  try {
    // verify the token
    const decoded = jwt.verify(token, process.env.SECRET);

    console.log("token:",decoded);
    _id = decoded._id;
    console.log("id:",_id);

    // updates user's isVerified field to true
    User.findByIdAndUpdate(_id, { isVerified: true }, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found", verified: false, expired: false });
      }
      return res.status(200).json({ message: "User verified", verified: true, expired: false });
    })
    .catch((error) => {
      // Handle errors
      return res.status(400).json({ error: error.message, verified: false, expired: false });
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ error: "Token expired", verified: false, expired: true });
    } else {
      res.status(400).json({ error: error.message, verified: false, expired: false });
    }
  }
};

// reset user password
const resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    User.findOne({ email }).then(async (user) => {
      if (!user.isVerified) {
        return res.status(400).json({ error: "Please verify the account from your email" });
      }
      newPassword = generatePassword(12);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      user.password = hash;

      await user.save();
      const subject = "Password Reset";
      const content = `Your new password for CampusConnect is:
  ${newPassword}
  Please change it after logging in for your security.`;
      sendEmail(email, subject, content);
      return res.status(200).json({ message: "Password reset" });
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser, getUser, getUserPosts, verifyUserEmail, resetPassword, updateUser, getUserFavorites, isFavorite,
  changeFavorite};

