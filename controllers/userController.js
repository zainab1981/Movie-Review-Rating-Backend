import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// @desc Register new user
// route POST /api/users
// @access public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400); // Changed from 404 to 400 as it's more appropriate
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "user",
  });

  if (user) {
    const token = generateToken(res, user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Login controller
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id);
    res.status(200).json({
      success: true,
      message: `Login Successful, ${user.name}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(401); // Changed from 400 to 401 for unauthorized
    throw new Error("Invalid email or password");
  }
});

// @desc Logout User
// route POST /api/users/logout
// @access public
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out" });
});

// @desc Get user profile
// route GET /api/users/profile
// @access private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };
  res.status(200).json(user);
});

// @desc Update user profile
// route PUT /api/users/profile
// @access private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  try {
    // Validate current password if trying to change password
    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        res.status(400);
        throw new Error("Current password is required to set new password");
      }

      const isPasswordValid = await user.matchPassword(
        req.body.currentPassword
      );
      if (!isPasswordValid) {
        res.status(400);
        throw new Error("Current password is incorrect");
      }

      // Set new password
      user.password = req.body.newPassword;
    }

    // Update other fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    // Generate new token after password change
    const token = req.body.newPassword ? generateToken(res, user._id) : null;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      ...(token && { token }), // Include new token only if password was changed
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc Get all users
// @route GET /api/users/all
// @access Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(200).json(users);
});

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
// @desc    Check user role
// @route   GET /api/users/check-role
// @access  Private
const checkUserRole = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const roleDetails = {
      role: user.role,
      permissions: {
        isAdmin: user.role === "admin",
        canCreateMovies: user.role === "admin",
        canDeleteMovies: user.role === "admin",
        canEditMovies: user.role === "admin",
        canViewUsers: user.role === "admin",
        canCreateReviews: true, // All authenticated users can create reviews
      },
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      status: "active",
      lastChecked: new Date(),
      message: `User authenticated as ${user.role}`,
    };

    res.json(roleDetails);
  } catch (error) {
    res.status(500);
    throw new Error("Error checking user role: " + error.message);
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  checkUserRole,
};
