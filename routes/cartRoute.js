const express = require("express");

const authService = require("../services/authService");
const cartService = require("../services/cartService");

const Router = express.Router();

Router.use(authService.protect, authService.restrict("user"));

Router.route("/applyCoupon").patch(cartService.applyCouponOnCart);

Router.patch("/removeCoupon", cartService.rmoveCouponFromCart);

Router.route("/")
  .post(cartService.addProductToCart)
  .get(cartService.getLoggedUserCart)
  .delete(cartService.clearCart);

Router.route("/:itemId")
  .patch(cartService.updateItemQuantity)
  .delete(cartService.removeItemFromCart);

module.exports = Router;
