const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Sub category name required")
    .isLength({ min: 2 })
    .withMessage("Too short sub category name")
    .isLength({ max: 32 })
    .withMessage("Too long sub category name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("sunCategory must belong to category")
    .isMongoId()
    .withMessage("Invalid main category id format"),
  validatorMiddleware,
];

exports.getSubCategoryValidator = [
  check("id")
    .notEmpty()
    .withMessage("SubCategory id required")
    .isMongoId()
    .withMessage("Invalid subCategory id format"),
  validatorMiddleware,
];
exports.updateSubCategoryValidator = [
  check("id")
    .notEmpty()
    .withMessage("SubCategory id required")
    .isMongoId()
    .withMessage("Invalid subCategory id format"),
  body("name").custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];
exports.deleteSubCategoryValidator = [
  check("id")
    .notEmpty()
    .withMessage("SubCategory id required")
    .isMongoId()
    .withMessage("Invalid subCategory id format"),
  validatorMiddleware,
];
