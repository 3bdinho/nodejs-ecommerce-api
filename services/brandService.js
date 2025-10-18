const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const Brand = require("../models/brandModel");
const handlersFactory = require("./handlersFactory");
const uploadImageMiddleware = require("../middlewares/uploadImageMiddleware");

//Image processing
exports.resizeCategoryImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `brands-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/brands/${filename}`);

  // Save image into DB
  req.body.image = filename;

  next();
});

// Upload single image
exports.uploadBrandimage = uploadImageMiddleware.uploadSingleImage("image");

// @desc    get brands
// @route   GET /api/v1/brands
// @access  public
exports.getBrands = handlersFactory.getAll(Brand);
// @desc    Create brand
// @route   Post  /api/v1/brands
// @access  Private
exports.createBrand = handlersFactory.createOne(Brand);

// @desc  get specific brand by id
// @route GET /api/v1/brands/:id
// @access public
exports.getBrand = handlersFactory.getOne(Brand);

// @desc  update specific brand by id
// @route patch /api/v1/brands/:id
// @access Private
exports.updateBrand = handlersFactory.updateOne(Brand);

// @desc  delete specific Brand by id
// @route delete /api/v1/categories/:id
// @access Private
exports.deleteBrand = handlersFactory.deleteOne(Brand);
