const express = require("express");

const authService = require("../services/authService");
const orderService = require("../services/orderService");

const Router = express.Router();

Router.use(authService.protect);

Router.get(
  "/checkout-session/:cartId",
  authService.restrict("user"),
  orderService.createCheckOutSession
);

Router.get(
  "/",
  authService.restrict("admin", "user"),
  orderService.filterLoggedUserOrder,
  orderService.findAllOrders
);

Router.patch(
  "/:id/pay",
  authService.restrict("admin"),
  orderService.updatePaidStatus
);

Router.patch(
  "/:id/deliver",
  authService.restrict("admin"),
  orderService.updateDeliveredStatus
);

Router.get(
  "/:id",
  authService.restrict("user"),
  orderService.findSpecificOrder
);

Router.route("/:cartId").post(
  authService.restrict("user"),
  orderService.createCashOrder
);

module.exports = Router;
