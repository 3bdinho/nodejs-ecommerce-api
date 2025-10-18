const express = require("express");

const CouponService = require("../services/couponService");
const couponValidator = require("../utils/validator/couponValidator");
const authService = require("../services/authService");

const router = express.Router();

router.use(authService.protect, authService.restrict("admin"));

router
  .route("/")
  .get(CouponService.getCoupons)
  .post(couponValidator.createCouponValidator, CouponService.createCoupon);

router
  .route("/:id")
  .get(couponValidator.getCouponValidator, CouponService.getCoupon)
  .patch(couponValidator.updateCouponValidator, CouponService.updateCoupon)
  .delete(couponValidator.deleteCouponValidator, CouponService.deleteCoupon);

module.exports = router;
