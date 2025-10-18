const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Sub category name required"],
      unique: [true, "Sub category name must be unique"],
      minLength: 3,
      maxLength: 32,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "SubCategory must be belong to parent category"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SubCategory", subCategorySchema);
