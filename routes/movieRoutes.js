import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
const router = express.Router();
import {
  getMovies,
  getOneMovie,
  createMovie,
} from "../controllers/movieController.js";

// Public routes (no authentication needed)
router.get("/", getMovies);
router.get("/:id", getOneMovie);

// Admin only routes (requires both authentication and admin role)
router.post("/", protect, admin, createMovie);

export default router;
