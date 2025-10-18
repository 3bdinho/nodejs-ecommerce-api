const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Cart must be belong to user"],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: String,
        price: Number,
      },
    ],
    totalCartPrice: {
      type: Number,
      default: 0,
    },
    totalPriceAfterDiscount: Number,
    couponApplied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
