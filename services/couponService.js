const Coupon = require("../models/couponModel");
const handlersFactory = require("./handlersFactory");

// @desc    get Coupons
// @route   GET /api/v1/Coupons
// @access  Private/admin
exports.getCoupons = handlersFactory.getAll(Coupon);

// @desc    Create Coupon
// @route   Post  /api/v1/Coupons
// @access  Private/admin
exports.createCoupon = handlersFactory.createOne(Coupon);

// @desc  get specific Coupon by id
// @route GET /api/v1/Coupons/:couponId
// @access Private/admin
exports.getCoupon = handlersFactory.getOne(Coupon);

// @desc  update specific Coupon by id
// @route patch /api/v1/Coupons/:couponId
// @access Private/admin
exports.updateCoupon = handlersFactory.updateOne(Coupon);

// @desc  delete specific Coupon by id
// @route delete /api/v1/Coupons/:couponId
// @access Private/admin
exports.deleteCoupon = handlersFactory.deleteOne(Coupon);
