const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const User = require("../models/userModel");
const ApiError = require("../utils/ApiError");
const handlersFactory = require("./handlersFactory");
const uploadImageMiddleware = require("../middlewares/uploadImageMiddleware");
const GenerateToken = require("../utils/GenerateToken");

//Image processing
exports.resizeUserImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `User-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/users/${filename}`);

  // Save image into DB
  req.body.profileImage = filename;

  next();
});

// Upload single image
exports.uploadUserimage =
  uploadImageMiddleware.uploadSingleImage("profileImage");

// @desc    get list of Users
// @route   GET /api/v1/Users
// @access  Private
exports.getUsers = handlersFactory.getAll(User);

// @desc    Create User
// @route   Post  /api/v1/Users
// @access  Private
exports.createUser = handlersFactory.createOne(User);

// @desc  get specific User by id
// @route GET /api/v1/Users/:id
// @access Private
exports.getUser = handlersFactory.getOne(User);

// @desc  update specific User by id
// @route patch /api/v1/Users/:id
// @access Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const doc = await model.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImage: req.body.profileImage,
      role: req.body.role,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!doc) {
    return next(new ApiError(`${model.modelName} not found`, 404));
  }

  res.status(200).json({
    status: "success",
    data: doc,
  });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  const user = await User.findById(id);

  if (!user) {
    return next(new ApiError(`User not found`, 404));
  }
  user.password = hashedPassword;
  user.save();

  res.status(200).json({
    status: "success",
    data: user,
  });
});

// @desc  delete specific User by id
// @route delete /api/v1/users/:id
// @access Private
exports.deleteUser = handlersFactory.deleteOne(User);

// @desc  get logged user data
// @route patch /api/v1/Users/getMe
// @access Private/protect
exports.getMe = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
  // res.status(200).json(req.user);
});

// @desc  update logged user password
// @route patch /api/v1/Users/updateMyPassword
// @access Private/protect
exports.updateMyPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  // update the password manually
  user.password = req.body.password;
  await user.save();

  // Generate token
  const token = GenerateToken(user._id);
  res.status(200).json({
    status: "success",
    message: "Password update successfully",
    token,
  });
});

// @desc  update logged user data
// @route patch /api/v1/Users/updateMyData
// @access Private/protect
exports.updateMyData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name, email: req.body.email, phone: req.body.phone },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});

// @desc  delete logged user
// @route patch /api/v1/Users/deleteMe
// @access Private/protect
exports.deactivateMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  user.active = false;
  user.save();
  res.status(204).json({
    status: "success",
  });
});
