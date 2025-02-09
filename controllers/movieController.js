import asyncHandler from "express-async-handler";
import Movie from "../models/movieModel.js";

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
const getMovies = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.keyword
    ? {
        title: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const count = await Movie.countDocuments({ ...keyword });
  const movies = await Movie.find({ ...keyword })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    movies,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get one movie
// @route   GET /api/movies/:id
// @access  Public
const getOneMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id).populate({
    path: "reviews",
    populate: {
      path: "user",
      select: "name",
    },
  });

  if (movie) {
    res.json(movie);
  } else {
    res.status(404);
    throw new Error("Movie not found");
  }
});

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    rating,
    poster,
    genres,
    director,
    year,
    duration,
  } = req.body;

  // Validate required fields
  if (
    !title ||
    !description ||
    !poster ||
    !genres ||
    !director ||
    !year ||
    !duration
  ) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  // Validate genres
  const validGenres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "Western",
  ];

  const invalidGenres = genres.filter((genre) => !validGenres.includes(genre));
  if (invalidGenres.length > 0) {
    res.status(400);
    throw new Error(`Invalid genres: ${invalidGenres.join(", ")}`);
  }

  try {
    const movie = await Movie.create({
      title,
      description,
      rating: rating || 0,
      poster,
      genres,
      director,
      year,
      duration,
    });

    res.status(201).json(movie);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    res.status(404);
    throw new Error("Movie not found");
  }

  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        rating: req.body.rating || movie.rating,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json(updatedMovie);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    res.status(404);
    throw new Error("Movie not found");
  }

  try {
    await movie.deleteOne();
    res.json({ message: "Movie removed successfully" });
  } catch (error) {
    res.status(400);
    throw new Error("Error removing movie");
  }
});

// @desc    Add review to movie
// @route   POST /api/movies/:id/reviews
// @access  Private
const addMovieReview = asyncHandler(async (req, res) => {
  const { rating, reviewText } = req.body;

  const movie = await Movie.findById(req.params.id);

  if (movie) {
    const alreadyReviewed = movie.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Movie already reviewed");
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      reviewText,
    };

    movie.reviews.push(review);
    await movie.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Movie not found");
  }
});

export {
  getMovies,
  getOneMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  addMovieReview,
};
