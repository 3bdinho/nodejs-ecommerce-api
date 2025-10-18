const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createCouponValidator = [
  check("name").notEmpty().withMessage("Coupon name required"),
  check("expire")
    .notEmpty()
    .withMessage("Expire date required")
    .custom((val) => {
      const expireDate = new Date(val);
      if (expireDate < new Date())
        throw new Error("Expire date should be in the future");
      return true;
    }),
  validatorMiddleware,
];

exports.getCouponValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];

exports.updateCouponValidator = [
  check("name").optional().notEmpty().withMessage("Coupon name required"),
  check("id").isMongoId().withMessage("Invalid id format"),
  check("expire")
    .notEmpty()
    .withMessage("Expire date required")
    .custom((val) => {
      const expireDate = new Date(val);
      if (expireDate < new Date())
        throw new Error("Expire date should be in the future");
      return true;
    }),
  validatorMiddleware,
];

exports.deleteCouponValidator = [
  check("id").isMongoId().withMessage("Invalid id format"),
  validatorMiddleware,
];
