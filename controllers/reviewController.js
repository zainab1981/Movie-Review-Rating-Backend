// controllers/reviewController.js
import asyncHandler from "express-async-handler";
import Movie from "../models/movieModel.js";

// @desc    Create movie review
// @route   POST /api/movies/:id/reviews
// @access  Private
// controllers/reviewController.js
const createReview = asyncHandler(async (req, res) => {
  const { rating, reviewText } = req.body;
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId);

    if (!movie) {
      res.status(404);
      throw new Error("Movie not found");
    }

    // Check if user has already reviewed this movie
    const alreadyReviewed = movie.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("You have already reviewed this movie");
    }

    // Create new review
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      reviewText,
    };

    // Add review to movie
    movie.reviews.push(review);

    // Update movie ratings
    movie.calculateAverageRating();

    // Save movie
    await movie.save();

    res.status(201).json({
      message: "Review added successfully",
      review,
      averageRating: movie.averageRating,
      numReviews: movie.numReviews,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get movie reviews
// @route   GET /api/movies/:id/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate({
      path: "reviews.user",
      select: "name",
    });

    if (!movie) {
      res.status(404);
      throw new Error("Movie not found");
    }

    res.json({
      reviews: movie.reviews,
      numReviews: movie.numReviews,
      averageRating: movie.averageRating,
    });
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});

// @desc    Delete review
// @route   DELETE /api/movies/:id/reviews
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      res.status(404);
      throw new Error("Movie not found");
    }

    // Find review index
    const reviewIndex = movie.reviews.findIndex(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (reviewIndex === -1) {
      res.status(404);
      throw new Error("Review not found");
    }

    // Remove review
    movie.reviews.splice(reviewIndex, 1);

    // Update movie ratings
    movie.calculateAverageRating();

    // Save movie
    await movie.save();

    res.json({ message: "Review removed" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export { createReview, getReviews, deleteReview };
