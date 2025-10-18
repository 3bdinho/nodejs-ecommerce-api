const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must be belong to user"],
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: [true, "Order item must belong to a product"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        color: String,
        price: {
          type: Number,
          required: [true, "Price is required"],
        },
      },
    ],
    shippingAddress: {
      details: {
        type: String,
        required: [true, "Shipping address details are required"],
      },
      phone: {
        type: String,
        required: [true, "Phone number is required for delivery"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      postalCode: String,
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },
    paymentMethodType: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,

    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name profileImg email phone",
  }).populate({
    path: "cartItems.product",
    select: "title",
  });
  next();
});

module.exports = mongoose.model("Order", orderSchema);
