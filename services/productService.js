const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const Product = require("../models/productModel");
const uploadImageMiddleware = require("../middlewares/uploadImageMiddleware");
const handlersFactory = require("./handlersFactory");

exports.uploadProductImages = uploadImageMiddleware.uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

exports.resizeImage = asyncHandler(async (req, res, next) => {
  //
  if (req.files.imageCover) {
    const imageCoverFileName = `products-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/products/imageCover/${imageCoverFileName}`);

    req.body.imageCover = imageCoverFileName;
  }

  //images
  if (req.files.images) {
    const images = await Promise.all(
      req.files.images.map(async (image, index) => {
        const imageName = `products-${uuidv4()}-${Date.now()}-${index}.jpeg`;

        await sharp(image.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/images/${imageName}`);

        //Save image into our DB
        return imageName;
      })
    );

    req.body.images = images;
  }

  next();
});

// @desc    get product
// @route   GET /api/v1/products
// @access  public
exports.getProducts = handlersFactory.getAll(Product, "Product");

// @desc    Create product
// @route   Post  /api/v1/products
// @access  Private
exports.createProduct = handlersFactory.createOne(Product);

// @desc  get specific product by id
// @route GET /api/v1/Products/:id
// @access public
exports.getProduct = handlersFactory.getOne(Product, "reviews");

// @desc  update specific product by id
// @route patch /api/v1/products/:id
// @access Private
exports.updateProduct = handlersFactory.updateOne(Product);

// @desc  delete specific product by id
// @route delete /api/v1/products/:id
// @access Private
exports.deleteProduct = handlersFactory.deleteOne(Product);
