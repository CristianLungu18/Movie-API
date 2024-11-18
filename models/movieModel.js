const mongoose = require("mongoose");
const validator = require("validator");

const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A movie must have a name!"],
    unique: true,
    maxLength: [100, "The name must not have more than 100 characters"],
    minLength: [4, "The name must have at least 4 characters"],
    trim: true,
    validate: [validator.isAlpha, "Name should only contain alphabets!"],
  },
  description: {
    type: String,
    required: [true, "A movie must have a description!"],
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, "A movie must have a duration!"],
  },
  rating: {
    type: Number,
    validate: {
      validator: function (value) {
        if (value >= 1 && value <= 10) {
          return true;
        } else {
          return false;
        }
      },
      message: "Ratings ({VALUE}) should be above 1 and below 10!",
    },
  },
  totalRating: {
    type: Number,
  },
  releaseYear: {
    type: Number,
    required: [true, "A movie must have a release year!"],
  },
  releaseDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  genres: {
    type: [String],
    required: [true, "A movie must have a gen!"],
    enum: {
      values: [
        "Action",
        "Adventures",
        "Sci-fi",
        "Thriller",
        "Crime",
        "Drama",
        "Comedy",
        "Romance",
        "Biography",
      ],
      message: "This genre does not exist!",
    },
  },
  directors: {
    type: [String],
    required: [true, "A movie must have at least one director!"],
  },
  coverImage: {
    type: String,
    required: [true, "A movie must have a cover image!"],
  },
  actors: {
    type: [String],
    required: [true, "A movie must have at least one actor!"],
  },
  price: {
    type: Number,
    required: [true, "A movie must have a price!"],
  },
});

const movieModel = mongoose.model("Movie", movieSchema);

module.exports = movieModel;
