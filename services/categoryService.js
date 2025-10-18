const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

const Category = require("../models/categoryModel");
const handlersFactory = require("./handlersFactory");
const uploadImageMiddleware = require("../middlewares/uploadImageMiddleware");

//Image processing
exports.resizeCategoryImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/categories/${filename}`);

  // Save image into DB
  req.body.image = filename;

  next();
});

// Upload single image
exports.uploadCategoryimage = uploadImageMiddleware.uploadSingleImage("image");

// @desc    get category
// @route   GET /api/v1/categories
// @access  public
exports.getCategories = handlersFactory.getAll(Category);

// @desc    Create category
// @route   Post  /api/v1/categories
// @access  Private
exports.createCategorie = handlersFactory.createOne(Category);

// @desc  get specific category by id
// @route GET /api/v1/categories/:id
// @access public
exports.getCategory = handlersFactory.getOne(Category);

// @desc  update specific category by id
// @route patch /api/v1/categories/:id
// @access Private
exports.updateCategory = handlersFactory.updateOne(Category);

// @desc  delete specific category by id
// @route delete /api/v1/categories/:id
// @access Private
exports.deleteCategory = handlersFactory.deleteOne(Category);
