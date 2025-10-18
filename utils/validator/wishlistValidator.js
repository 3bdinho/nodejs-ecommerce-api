const { check } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.addProductToWishlistValidator = [
  check("productId").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleware,
];

exports.removeProductFromWishlistValidator = [
  check("productId").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleware,
];
