const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const customError = require("../utils/customError");
const bcrypt = require("bcrypt");
const { promisify } = require("util");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const signToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser);

  res.status(201).json({
    status: "succes",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new customError("Please provide email or password for login in!", 400)
    );
  }

  const findUser = await User.findOne({ email });

  if (!findUser || !(await bcrypt.compare(password, findUser.password))) {
    return next(new customError("Invalid email or password!", 400));
  }

  const token = signToken(findUser);

  res.status(200).json({
    status: "succes",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(new customError("You are not logged in!", 401));
  }
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const user = await User.findById(decodedToken.id).select("-password");

  if (!user) {
    return next(
      new customError("The user with the given token does not exist!", 401)
    );
  }

  if (user.isPasswordChanged(decodedToken.iat)) {
    return next(
      new customError("The password was changed, please log in again!", 400)
    );
  }

  req.user = user;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new customError(
          "You don't have the permision to perform this action!",
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new customError("We could not find the user with given email!", 404));
  }
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `We have received a password reset request. Please use the below link to reset your password\n\n${resetUrl}\n\nThis reset password link will be valid only for 10 minutes`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password change request received!",
      text: message,
    });
    res.status(200).json({
      status: "succes",
      message: "password reset link send to the user email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new customError(
        "There was an error sending password reset email. Please try again later!",
        500
      )
    );
  }
});

exports.passwordReset = catchAsync(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new customError("Token is invalid or has expired!", 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  user.passwordChangedAt = Date.now();

  user.save();

  const loginToken = signToken(user);

  res.status(200).json({
    status: "succes",
    token: loginToken,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const currentPass = req.body.currentPassword;
  const hashCurrentPass = await bcrypt.hash(currentPass, 12);
  
  if (!(await bcrypt.compare(hashCurrentPass, user.password))) {
    return next(
      new customError("The current password you provide is wrong!", 400)
    );
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();
  const token = signToken(user);
  res.status(200).json({
    status: "succes",
    token,
  });
});
