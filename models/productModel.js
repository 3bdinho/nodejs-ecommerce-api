//name brand category subcategory rate color images desc price reviews
const mongoose = require("mongoose");

const Category = require("./categoryModel");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "enter product title"],
      trim: true,
      minLength: [3, "Too short product title"],
      maxLength: [100, "Too long product title"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "product must be belong to category"],
    },
    subCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    colors: [String],
    imageCover: {
      type: String,
      required: [true, "Product image coveer required"],
    },
    images: {
      type: [String],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minLength: [20, "Too short product description"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
      // min: [0,'quantity must be positive']
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "product price is required"],
      trim: true,
    },
    priceAfterDiscount: {
      type: Number,
    },
  },
  {
    timestamps: true,
    // To enable populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const setImageURL = (doc) => {
  if (doc.imageCover) {
    const imageCoverUrl = `${process.env.BASE_URL}/products/imageCover/${doc.imageCover}`;
    doc.imageCover = imageCoverUrl;
  }
  if (doc.images) {
    const imagesUrl = doc.images.map(
      (image) => `${process.env.BASE_URL}/products/images/${image}`
    );
    doc.images = imagesUrl;
  }
};

//mongoose middlewares
productSchema.pre("save", async function (next) {
  const category = await Category.findById(this.category);
  if (!category) {
    return next(new Error("Category not found"));
  }
  next();
});

productSchema.pre(/^find/, async function (next) {
  this.populate("category", "name -_id");
  next();
});

//getAll,getOne and update
productSchema.post("init", (doc) => setImageURL(doc));

// create
productSchema.post("save", (doc) => setImageURL(doc));

// Virtual populate
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

module.exports = mongoose.model("Product", productSchema);
