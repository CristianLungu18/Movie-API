const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:resetToken").patch(authController.passwordReset);
router
  .route("/updatePassword")
  .patch(authController.protect, authController.updatePassword);
module.exports = router;
