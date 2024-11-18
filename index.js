require("dotenv").config();
const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const path = require("path");
const customError = require("./utils/customError");
const globalErrorHandler = require("./controllers/errrorController");

//APP
const app = express();

//ROUTES
const movieRoutes = require("./routes/movieRoutes");
const authRoutes = require("./routes/authRoutes");
//MIDDLEWARE
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use((req, res, next) => {
  req.createdAt = new Date().toISOString();
  next();
});

//SERVING STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

//ROUTES
app.use("/api/v1/movies", movieRoutes);
app.use("/api/v1/users", authRoutes);
app.all("*", (req, res, next) => {
  next(new customError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
