const asyncHandler = require("express-async-handler");

const Cart = require("../models/cartSchema");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const ApiError = require("../utils/ApiError");

const calcTotalCartPrice = (cart) =>
  cart.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

// @desc    Add product to cart
// @route   post /api/v1/cart
// @access  private/user
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const product = await Product.findById(productId);
  // Check if product exists
  if (!product)
    return next(new ApiError("there is not product with that id", 400));

  //1)Get cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  // If he didnt have a cart
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    //If product exists in cart, update product quantity
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && color === item.color
    );
    if (itemIndex > -1) {
      cart.cartItems[itemIndex].quantity += 1;
    } else {
      //push product to cart items
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price,
      });
    }
  }

  //Calculate total cart price
  cart.totalCartPrice = calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    msg: "product added to cart successfully",
    data: cart,
  });
});

// @desc    Get logged user cart
// @route   post /api/v1/cart/getMyCart
// @access  private/user
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  // Find the cart for the logged-in user
  const cart = await Cart.findOne({ user: req.user._id });

  // If no cart exists
  if (!cart) return next(new ApiError("You don't have cart yet.", 404));

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Remove specific item from cart
// @route   Delete /api/v1/cart/:id
// @access  private/user
exports.removeItemFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) return next(new ApiError("You don't have a cart yet.", 404));

  //Remove product by id
  cart.cartItems.pull({ _id: req.params.itemId });

  //Recalculate total cart price
  cart.totalCartPrice = calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    msg: "Item romved successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc    Clear  cart
// @route   Delete /api/v1/cart
// @access  private/user
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(200).json({
    status: "success",
  });
});

// @desc    Update cart item quantity
// @route   patch /api/v1/cart/:itemId
// @access  private/user
exports.updateItemQuantity = asyncHandler(async (req, res, next) => {
  //   const { itemId, quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ApiError("You don't have a cart yet.", 404));

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex === -1)
    return next(new ApiError("Item not found in you cart", 404));

  // Update quantity
  cart.cartItems[itemIndex].quantity = req.body.quantity;

  // Recalculate total price
  cart.totalCartPrice = calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    data: cart,
  });
});

// @desc    Apply coupon on logged user cart
// @route   patch /api/v1/cart/applyCoupon
// @access  private/user
exports.applyCouponOnCart = asyncHandler(async (req, res, next) => {
  // 1. Check if cart exists
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ApiError("You don't have a cart yet.", 404));

  // 2. Find coupon based on copuon name
  const copuon = await Coupon.findOne({
    name: req.body.copuon,
    expire: { $gt: Date.now() },
  });
  if (!copuon) return next(new ApiError(`Coupon is invalid or expire`, 404));

  // 3. Apply discount
  cart.totalPriceAfterDiscount = (
    cart.totalCartPrice -
    (cart.totalCartPrice * copuon.discount) / 100
  ).toFixed(2);

  cart.couponApplied = true;

  await cart.save();

  res.status(200).json({
    status: "success",
    data: cart,
  });
});

// @desc    Remove coupon from logged user cart
// @route   patch /api/v1/cart/removeCoupon
// @access  private/user
exports.rmoveCouponFromCart = asyncHandler(async (req, res, next) => {
  // 1. Check if cart exists
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ApiError("You don't have a cart yet.", 404));

  // 2. reset price after discount and couponApplied
  cart.totalPriceAfterDiscount = undefined;
  cart.couponApplied = false;

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Coupon removed successfully",
    data: cart,
  });
});
