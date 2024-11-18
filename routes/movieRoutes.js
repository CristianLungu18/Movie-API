const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const authController = require("../controllers/authController");
// router.param("id", (req, res, next, value) => {
//   console.log(`Movie ID is ${value}`);
//   next();
// });

router
  .route("/top-5-movies")
  .get(movieController.top5Movies, movieController.getAllMovies);

router
  .route("/")
  .get(authController.protect, movieController.getAllMovies)
  .post(movieController.createMovie);

router
  .route("/:id")
  .get(movieController.getMovieById)
  .patch(movieController.updateMovie)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    movieController.deleteMovie
  );

module.exports = router;
