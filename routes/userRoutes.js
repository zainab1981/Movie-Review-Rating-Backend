import express from "express";
const router = express.Router();
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  checkUserRole,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// Public routes
router.post("/", registerUser);
router.post("/auth", loginUser);
router.post("/logout", logoutUser);

router.get("/check-role", protect, checkUserRole);

// Protected routes (requires authentication)
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// Admin routes (requires both authentication and admin role)
router.get("/all", protect, admin, getAllUsers);
router.delete("/:id", protect, admin, deleteUser);

export default router;
