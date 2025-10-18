const express = require("express");

const productService = require("../services/productService");

const ProductValidator = require("../utils/validator/productValidator");
const authService = require("../services/authService");
const reviewRouter = require("./reviewRoute");

const router = express.Router();

router
  .route("/")
  .post(
    authService.protect,
    authService.restrict("admin", "seller"),
    productService.uploadProductImages,
    productService.resizeImage,
    ProductValidator.createProductValidator,
    productService.createProduct
  )
  .get(productService.getProducts);

router
  .route("/:id")
  .get(ProductValidator.getProductValidator, productService.getProduct)
  .patch(
    authService.protect,
    authService.restrict("admin", "seller"),
    productService.uploadProductImages,
    productService.resizeImage,
    ProductValidator.updateProductValidator,
    productService.updateProduct
  )
  .delete(
    authService.protect,
    authService.restrict("admin", "seller"),
    ProductValidator.deleteProductValidator,
    productService.deleteProduct
  );

// Nested route
router.use("/:productId/reviews", reviewRouter);

module.exports = router;
