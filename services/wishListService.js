const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// @desc    add product to wishlist
// @route   Post /api/v1/wishlist
// @access  Private/User
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product added to wishlist",
    data: user.wishlist,
  });
});

// @desc    Romve product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private/User
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    $pull: { wishlist: req.params.productId },
  });
  res
    .status(200)
    .json({ message: "Product removed successfully", data: user.wishlist });
});

// @desc    Get logged user wishlist
// @route   GET /api/v1/wishlist
// @access  Private/User
exports.GetLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    slect: "title",
  });
  res.status(200).json({
    status: "success",
    msg: "You wishlist",
    result: user.wishlist.length,
    data: user.wishlist,
  });
});
