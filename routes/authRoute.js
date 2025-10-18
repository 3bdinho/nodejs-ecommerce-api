const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  verifyResetPasswordCode,
  resetPassword,
} = require("../services/authService");

const {
  singupValidator,
  loginValidator,
} = require("../utils/validator/authValidator");

const router = express.Router();

router.route("/signup").post(singupValidator, signup);
router.route("/login").post(loginValidator, login);
router.post("/forgotpassword", forgotPassword);
router.post("/verifyresetpasswordcode", verifyResetPasswordCode);
router.patch("/resetpassword", resetPassword);

module.exports = router;
