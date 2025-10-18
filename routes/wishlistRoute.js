const express = require("express");
const wishlistService = require("../services/wishListService");

const {
  addProductToWishlistValidator,
  removeProductFromWishlistValidator,
} = require("../utils/validator/wishlistValidator");
const authService = require("../services/authService");

const router = express.Router();

router.use(authService.protect, authService.restrict("user"));

router
  .route("/")
  .get(wishlistService.GetLoggedUserWishlist)
  .post(addProductToWishlistValidator, wishlistService.addProductToWishlist);

router.delete(
  "/:productId",
  removeProductFromWishlistValidator,
  wishlistService.removeProductFromWishlist
);

module.exports = router;
