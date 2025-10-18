const express = require("express");
const addressService = require("../services/addressService");

// const {
//   addProductToWishlistValidator,
//   removeProductFromWishlistValidator,
// } = require("../utils/validator/wishlistValidator");

const authService = require("../services/authService");

const router = express.Router();

router.use(authService.protect, authService.restrict("user"));

router
  .route("/")
  .get(addressService.GetLoggedUserAddresses)
  .post(addressService.addAddress);

router.delete("/:addressId", addressService.removeAddress);

module.exports = router;
