// routes/reviewRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createReview,
  getReviews,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

// Keep the routes as they are since they're working with the base path from server.js
router
  .route("/:id/reviews")
  .get(getReviews)
  .post(protect, createReview)
  .delete(protect, deleteReview);

export default router;
