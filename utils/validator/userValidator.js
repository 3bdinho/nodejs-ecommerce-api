const { check, body } = require("express-validator");
const { default: slugify } = require("slugify");
const bcrypt = require("bcryptjs");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

// rules
exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),

  validatorMiddleware,
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .isLength({ max: 32 })
    .withMessage("Too long User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("User email required")
    .isEmail()
    .withMessage("Invalid user email format")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),

  check("password")
    .notEmpty()
    .withMessage("User password required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters")
    .custom((val, { req }) => {
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirm invorrect");
      }
      return true;
    }),

  check("profileImage").optional(),
  check("phone")
    .optional({ checkFalsy: true })
    .isMobilePhone(["ar-EG"])
    .withMessage("Invalid phone number only accpted egy"),
  check("role").optional(),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),

  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("User email required")
    .isEmail()
    .withMessage("Invalid user email format")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),
  check("profileImage").optional(),
  check("phone")
    .optional({ checkFalsy: true })
    .isMobilePhone(["ar-EG"])
    .withMessage("Invalid phone number only accpted egy"),
  check("role").optional(),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  body("password")
    .notEmpty()
    .withMessage("User password required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters")
    .custom(async (val, { req }) => {
      //1-Verify current password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("User not exists");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );

      if (!isCorrectPassword) throw new Error("incorrect current Password");

      //2-Verify password Confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirm incorrect");
      }
      return true;
    }),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),

  body("currentPassword").notEmpty().withMessage("Current password required"),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("User email required")
    .isEmail()
    .withMessage("Invalid user email format")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already in user"));
        }
      })
    ),
  check("phone")
    .optional({ checkFalsy: true })
    .isMobilePhone(["ar-EG"])
    .withMessage("Invalid phone number only accpted egy"),
  validatorMiddleware,
];
