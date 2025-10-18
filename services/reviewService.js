const asyncHandler = require("express-async-handler");

const handlersFactory = require("./handlersFactory");
const Review = require("../models/reviewsModel");

// Nested route
// Get /api/v1/products/:productId/reviews
exports.createFilterObject = (req, res, next) => {
  // For nested route
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };

  req.filterObj = filterObject;

  next();
};

//Nested route
// Post /api/v1/products/:productId/reviews
exports.setProductIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc    get list of reviews
// @route   GET /api/v1/reviews
// @access  public
exports.getReviews = handlersFactory.getAll(Review);

// @desc    Create Review
// @route   Post  /api/v1/Reviews
// @access  Private/protect/user
exports.createReview = handlersFactory.createOne(Review);

// @desc  get specific Review by id
// @route GET /api/v1/Reviews/:id
// @access public
exports.getReview = handlersFactory.getOne(Review);

// @desc  update specific Review by id
// @route patch /api/v1/Reviews/:id
// @access Private/protect/user
exports.updateReview = handlersFactory.updateOne(Review);

// @desc  delete specific Review by id
// @route delete /api/v1/categories/:id
// @access Private/protect/user-admin-
exports.deleteReview = handlersFactory.deleteOne(Review);
