//schema
const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "brand name required"],
      unique: [true, "brand must be unique"],
      minlength: [3, "too short brand name"],
      maxlength: [32, "too long brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};

brandSchema.post("init", (doc) => setImageURL(doc));

brandSchema.post("save", (doc) => setImageURL(doc));

module.exports = mongoose.model("Brand", brandSchema);
