const mongoose = require("mongoose");

const Product = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "Min ratings value is 1.0"],
      max: [5, "Max ratings value is 5.0"],
      required: [true, "Review ratings required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to user"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to product"],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.statics.calcAverageRatings = async function (productId) {
  const static = await this.aggregate([
    // Stage 1: Get all reviews in specific product
    { $match: { product: productId } },
    // Stage 2: Groping reviews per product id and calc avgRating and quantity
    {
      $group: {
        _id: "$product",
        nratings: { $sum: 1 },
        avgRating: { $avg: "$ratings" },
      },
    },
  ]);

  console.log(static[0]);
  if (static.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: static[0].nratings,
      ratingsAverage: static[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatings(this.product);
});

reviewSchema.post("findOneAndDelete", (doc) => {
  if (doc) doc.constructor.calcAverageRatings(doc.product);
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  });
  next();
});

module.exports = mongoose.model("Review", reviewSchema);
