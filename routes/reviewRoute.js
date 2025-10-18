const express = require("express");
const BrandService = require("../services/brandService");

const {
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validator/reviewValidator");

const reviewService = require("../services/reviewService");
const authService = require("../services/authService");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewService.createFilterObject, reviewService.getReviews)
  .post(
    authService.protect,
    authService.restrict("user"),
    reviewService.setProductIdToBody,
    createReviewValidator,
    reviewService.createReview
  );

router
  .route("/:id")
  .get(reviewService.getReview)
  .patch(
    authService.protect,
    authService.restrict("user"),
    updateReviewValidator,
    reviewService.updateReview
  )
  .delete(
    authService.protect,
    authService.restrict("admin", "user"),
    deleteReviewValidator,
    reviewService.deleteReview
  );

module.exports = router;
