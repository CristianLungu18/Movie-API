const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name!"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "A user must have an email!"],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email adress!"],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: {
      values: ["user", "admin"],
      message: "This role does not exist!",
    },
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please enter a password!"],
    min: [8, "The password should have minimum 8 characters!"],
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password!"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "The passwords don't match!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.isPasswordChanged = function (JWTTime) {
  if (this.passwordChangedAt) {
    const passwordChangedTimeStamp = +this.passwordChangedAt.getTime() / 1000;
    return passwordChangedTimeStamp > JWTTime;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, this.passwordResetToken);
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
