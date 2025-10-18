const { check, body } = require("express-validator");
const { default: slugify } = require("slugify");

const Review = require("../../models/reviewsModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const MESSAGES = {
  TITLE_SHORT: "Review title must be at least 3 characters",
  TITLE_LONG: "Review title cannot exceed 400 characters",
  PRODUCT_REQUIRED: "Review must belong to a product",
  USER_REQUIRED: "Review must belong to a user",
  ONE_REVIEW: "You can only add one review per product",
};

exports.createReviewValidator = [
  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage(MESSAGES.TITLE_SHORT)
    .isLength({ max: 400 })
    .withMessage(MESSAGES.TITLE_LONG),

  check("product")
    .notEmpty()
    .withMessage(MESSAGES.PRODUCT_REQUIRED)
    .isMongoId()
    .withMessage("Invalid product ID format — must be a MongoDB ObjectId"),

  check("user")
    .notEmpty()
    .withMessage(MESSAGES.USER_REQUIRED)
    .isMongoId()
    .withMessage("Invalid user ID format — must be a MongoDB ObjectId")
    .custom(async (val, { req }) => {
      const review = await Review.exists({
        user: val,
        product: req.body.product,
      });
      if (review) {
        throw new Error(MESSAGES.ONE_REVIEW);
      }
    }),
  check("ratings")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review ID format — must be a MongoDB ObjectId")
    .custom(async (val, { req }) => {
      // Find the review by its ID (from route params)
      const review = await Review.findById(val);

      // 1-If the review doesn’t exist
      if (!review) throw new Error("No review found with this ID");

      // 2️- If the logged-in user is not the review owner
      if (review.user._id.toString() !== req.user._id.toString()) {
        throw new Error("You are not allowed to update this review");
      }

      req.review = review;
      return true;
    }),
  check("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short title review")
    .isLength({ max: 400 })
    .withMessage("Too long title review"),
  check("ratings")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review ID format — must be a MongoDB ObjectId")
    .custom(async (val, { req }) => {
      if (req.user.role === "user") {
        // Find the review by its ID (from route params)
        const review = await Review.findById(val);

        // 1-If the review doesn’t exist
        if (!review) throw new Error("No review found with this ID");

        // 2️- If the logged-in user is not the review owner
        if (review.user._id.toString() !== req.user._id.toString()) {
          throw new Error("You are not allowed to delete this review");
        }
      }
      return true;
    }),
  validatorMiddleware,
];
