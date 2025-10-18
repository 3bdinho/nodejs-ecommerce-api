const Stripe = require("stripe")(process.env.STRIPE_SECRET);
const asyncHandler = require("express-async-handler");

const Order = require("../models/orderModel");
const Cart = require("../models/cartSchema");
const Product = require("../models/productModel");
const handlersFactory = require("./handlersFactory");
const ApiError = require("../utils/ApiError");

// @desc    Create cash order
// @route   POST /api/v1/orders/cartId
// @access  Private/user
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart)
    return next(new ApiError(`There is no cart with id:${req.params.cartId}`));

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.couponApplied
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create Order with default paymentMethodType
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4) After creating order decrement product quantity and increment product sold
  if (order) {
    const bulkOpthion = order.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { sold: +item.quantity, quantity: -item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOpthion);

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({
    status: "success",
    data: order,
  });
});

// @desc    Get logged user order
// @route   Get /api/v1/orders/MyOrders
// @access  Private/user
exports.filterLoggedUserOrder = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObject = { user: req.user._id };
  next();
});

// @desc    Get all orders
// @route   Get /api/v1/orders/orders
// @access  Private/admin
exports.findAllOrders = handlersFactory.getAll(Order);

// @desc    Get specific order
// @route   Get /api/v1/orders/:orderId
// @access  Private/admin
exports.findSpecificOrder = handlersFactory.getOne(Order);

// @desc    update order paid status to paid
// @route   Get /api/v1/orders/:Id/pay
// @access  Private/admin
exports.updatePaidStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      isPaid: true,
      paidAt: Date.now(),
    },
    { new: true }
  );

  if (!order)
    return next(
      new ApiError(`There is no order for this id: ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: "success",
    data: order,
  });
});

// @desc    update order delivered status
// @route   Get /api/v1/orders/:Id/deliver
// @access  Private/admin
exports.updateDeliveredStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      isDelivered: true,
      deliveredAt: Date.now(),
    },
    { new: true }
  );

  if (!order)
    return next(
      new ApiError(`There is no order for this id: ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: "success",
    data: order,
  });
});

// @desc    Get checkout session from stripe and send it as response
// @route   Get /api/v1/orders/checkout-session/:cartId
// @access  Private/user
exports.createCheckOutSession = asyncHandler(async (req, res, next) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart)
    return next(new ApiError(`There is no cart with id:${req.params.cartId}`));

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.couponApplied
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) create checkout session
  const session = await Stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: req.user.name,
          },
          unit_amount: Math.round(totalOrderPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: { cartId: req.params.cartId },
  });

  //4) Send session to response
  res.status(200).json({ status: "success", session });
});
