import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
const router = express.Router();
import {
  getMovies,
  getOneMovie,
  createMovie,
  updateMovie, // Add these
  deleteMovie, // Add these
} from "../controllers/movieController.js";

// Public routes (no authentication needed)
router.get("/", getMovies);
router.get("/:id", getOneMovie);

// Admin only routes (requires both authentication and admin role)
router.route("/").get(getMovies).post(protect, admin, createMovie);

router
  .route("/:id")
  .get(getOneMovie)
  .put(protect, admin, updateMovie) // Add this route for editing
  .delete(protect, admin, deleteMovie); // Add this route for deleting

export default router;
