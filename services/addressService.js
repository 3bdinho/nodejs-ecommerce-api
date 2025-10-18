const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// @desc    Add address to user addAddress list
// @route   Post /api/v1/addresses
// @access  Private/User
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address added successfully",
    data: user.addresses,
  });
});

// @desc    Romve address from user addAddress list
// @route   DELETE /api/v1/addresses/:addressId
// @access  Private/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    $pull: { addresses: { _id: req.params.addressId } },
  });
  res
    .status(200)
    .json({ message: "Address removed successfully", data: user.addresses });
});

// @desc    Get logged user addresses list
// @route   GET /api/v1/addresses
// @access  Private/User
exports.GetLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");

  res.status(200).json({
    status: "success",
    result: user.addresses.length,
    data: user.addresses,
  });
});
