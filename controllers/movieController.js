const Movie = require("../models/movieModel");
const APIFeatures = require("../utils/APIFeatures");
const catchAsync = require("../utils/catchAsync");
const customError = require("../utils/customError");

exports.top5Movies = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = "-rating";
  next();
};

exports.getAllMovies = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Movie.find(), req.query)
    .filter()
    .sort()
    .Limitfields()
    .paginate();

  const movies = await features.query;
  res.status(200).json({
    status: "succes",
    results: movies.length,
    data: {
      movies,
    },
  });
});

exports.createMovie = catchAsync(async (req, res, next) => {
  const newMovie = await Movie.create(req.body);

  res.status(201).json({
    status: "succes",
    data: {
      movie: newMovie,
    },
  });
});

exports.getMovieById = catchAsync(async (req, res, next) => {
  const movieID = req.params.id;
  const findMovie = await Movie.findOne({ _id: movieID });

  if (!findMovie) {
    return next(
      new customError(
        `The movie with ID : ${movieID} does not exist in the database!`,
        404
      )
    );
  }

  res.status(200).json({
    status: "succes",
    data: {
      movie: findMovie,
    },
  });
});

exports.updateMovie = catchAsync(async (req, res, next) => {
  const movieID = req.params.id;
  const updatedMovie = await Movie.findByIdAndUpdate(movieID, req.body, {
    runValidators: true,
    new: true,
  });
  if (!updatedMovie) {
    return next(
      new customError(
        `The movie with ID : ${movieID} does not exist in the database!`,
        404
      )
    );
  }
  res.status(200).json({
    status: "succes",
    data: {
      movie: updatedMovie,
    },
  });
});

exports.deleteMovie = catchAsync(async (req, res, next) => {
  const movieID = req.params.id;
  const removedMovie = await Movie.findByIdAndDelete(movieID);
  if (!removedMovie) {
    return next(
      new customError(
        `The movie with ID : ${movieID} does not exist in the database!`,
        404
      )
    );
  }
  res.status(204).json({
    status: "succes",
    data: null,
  });
});
