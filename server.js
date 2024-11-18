process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught exception occured! Shutting down...");
  process.exit(1);
});
const app = require("./index");

const mongoose = require("mongoose");
require("dotenv").config();

//CREATE SERVER
const PORT = process.env.PORT || 3000;

//MODELS
const Movie = require("./models/movieModel");
const User = require("./models/userModel");

mongoose.connect(process.env.CONN_STR).then(() => {
  console.log("Database is connected!");
});

const server = app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled rejection occured! Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
 