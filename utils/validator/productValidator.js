const { check, body } = require("express-validator");
const { default: slugify } = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const SubCategory = require("../../models/subCategoryModel");

// rules
exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("product required")
    .isLength({ min: 3 })
    .withMessage("Too short product name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 2000 })
    .withMessage("Too long description"),
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity must be a number")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold").optional().isNumeric().withMessage("Sold must be a number"),
  check("price")
    .notEmpty()
    .withMessage("product price is required")
    .isFloat({ max: 999999999999999 })
    .withMessage("Too long price"),
  check("priceAfterDiscount")
    .optional()
    .isFloat()
    .withMessage("product priceAfterDiscount must be a number")
    .custom((value, { req }) => {
      if (value >= req.body.price) {
        throw new Error("priceAfterDiscount must be lower than price");
      }
      return true;
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("colors should be array of String"),
  check("imageCover").optional(), //.withMessage("Product imageCover is required"),
  check("images")
    .optional()
    .isArray()
    .withMessage("images should be array of String"),
  check("category")
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID format"),
  // .custom(async (categoryId) => {
  //   const category = await Category.findOne({ _id: categoryId });

  //   if (!category) return Promise.reject(new Error("Category not found"));

  //   return true;
  // }),
  check("subCategories")
    .optional()
    .isArray()
    .withMessage("Invalid ID format")
    .custom(async (subCategoriesIds, { req }) => {
      const subCategories = await SubCategory.find({
        _id: { $in: subCategoriesIds },
        category: req.body.category,
      });

      if (subCategories.length !== subCategoriesIds.length) {
        throw new Error(
          "Invalid subCategories IDs or not in the given category."
        );
      }
      return true;
    }),
  check("brand").optional().isMongoId().withMessage("Invalid ID format"),
  check("ratingsAverage")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1.0 and 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),
  validatorMiddleware,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id format"),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id format"),
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid product id format"),
  validatorMiddleware,
];
