const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const sendMail = require("../utils/sendMail");
const GenerateToken = require("../utils/GenerateToken");

const hashResetCode = (code) =>
  crypto.createHash("sha256").update(code).digest("hex");

// @desc    signup
// @route   post /api/v1/auth/signup
// @access  public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1-Create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // 2-Generate  JWT
  const token = GenerateToken(user._id);
  //   jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXP,
  //   });

  const { password, ...userData } = user.toObject();
  // 3-send res
  res.status(201).json({ data: userData, token });
});

// @desc    login
// @route   post /api/v1/auth/login
// @access  public
exports.login = asyncHandler(async (req, res, next) => {
  // check data(validator layer)
  // 1-check user exist and password correct
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password"));
  }

  // 2-Generate token
  const token = GenerateToken(user._id);

  // 3-send res
  res.status(200).json({
    data: user,
    token,
  });
});

// @desc   make sure the user is login
exports.protect = asyncHandler(async (req, res, next) => {
  // 1-check if token exist, if exist get it
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new ApiError("Not authorized, no token", 401));
  }
  const token = authHeader.split(" ")[1];

  // 2-Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3-check if user exist
  const user = await User.findById(decoded.id);
  if (!user || !user.active)
    return next(new ApiError("User no longer exists", 401));

  // 4-check if password changed after Generate token
  if (user.isPasswordChangedAfter(decoded.iat)) {
    return next(
      new ApiError("Password recently changed. Please log in again.", 401)
    );
  }

  // 5-Attach user to request
  req.user = user;
  next();
});

// @desc   authorization (user permissions)
exports.restrict = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1-access roles
    // 2-access registered user
    console.log(req.user.role);

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

// @desc    forgot password
// @route   get /api/v1/auth/forgotPassword
// @access  public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1-Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with that email: ${req.body.email}`)
    );
  }

  // 2-if user exist , Generate random 6 digits and save it in DB
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(resetCode);
  const hashedResetCode = hashResetCode(resetCode);
  // Save hashed password reset code in DB
  user.passwordResetCode = hashedResetCode;

  // Add expiretion time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  // 3-send the reset code via email
  try {
    await sendMail({
      to: req.body.email,
      subject: "Password Reset Code",
      text: `Your verification code is ${resetCode}. It is valid for 10 minutes only.`,
      html: `<p>Your verification code is <b>${resetCode}</b>. It is valid for 10 minutes only.</p>`,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    return next(new ApiError("there is an error in sending code", 500));
  }

  res
    .status(200)
    .json({ status: "success", message: "Reset code sent to email" });
});

// @desc    verify reset password code
// @route   get /api/v1/auth/verifyresetpasswordcode
// @access  public
exports.verifyResetPasswordCode = asyncHandler(async (req, res, next) => {
  // 1-Get user based on reset code
  const hashedResetCode = hashResetCode(req.body.resetCode);

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2-check if user exist
  if (!user) return next(new ApiError("Reset code invalid or expired", 400));

  // reset code valid
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: "success" });
  next();
});

// @desc    reset password
// @route   get /api/v1/auth/resetpassword
// @access  public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1-Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new ApiError(`there is no user with this email ${user.email}`));

  // 2-Check if reset code verfiy
  if (!user.passwordResetVerified)
    return next(new ApiError(`Reset code not verfiy`, 400));

  // update password
  user.password = req.body.password;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  // 3-Generate new token
  const token = GenerateToken(user._id);
  res.status(200).json({ status: "success", token });
});
