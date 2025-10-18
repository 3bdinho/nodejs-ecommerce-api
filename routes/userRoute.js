const express = require("express");
const UserService = require("../services/userService");

const {
  getUserValidator,
  createUserValidator,
  deleteUserValidator,
  updateUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validator/userValidator");
const authService = require("../services/authService");
const User = require("../models/userModel");

const router = express.Router();

//User
router.use(authService.protect);

router.get("/getMe", UserService.getMe, UserService.getUser);

router.patch(
  "/updateMyPassword",
  UserService.getMe,
  changeUserPasswordValidator,
  UserService.updateMyPassword
);

router.patch("/updateMe", updateLoggedUserValidator, UserService.updateMyData);

router.delete("/deleteMe", UserService.deactivateMe);

//Admin
router.use(authService.restrict("admin"));

router.patch(
  "/changePassword/:id",
  changeUserPasswordValidator,
  UserService.changeUserPassword
);

router
  .route("/")
  .get(UserService.getUsers)
  .post(
    UserService.uploadUserimage,
    UserService.resizeUserImage,
    createUserValidator,
    UserService.createUser
  );

router
  .route("/:id")
  .get(getUserValidator, UserService.getUser)
  .patch(
    UserService.uploadUserimage,
    UserService.resizeUserImage,
    updateUserValidator,
    UserService.updateUser
  )
  .delete(deleteUserValidator, UserService.deleteUser);

module.exports = router;
