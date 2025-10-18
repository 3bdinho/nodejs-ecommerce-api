const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "User name required"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "User email required"],
      unique: [true, "User email must be unique"],
      lowercase: true,
    },
    phone: String,
    profileImage: String,
    password: {
      type: String,
      required: [true, "User password required"],
      minlength: [6, "Too short password"],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["user", "admin", "seller"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.ObjectId },
        alias: {
          type: String,
          required: true,
        },
        details: {
          type: String,
          required: true,
        },
        phone: {
          type: String,
          required: true,
        },
        city: String,
        postalCode: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const setImageURL = (doc) => {
  if (doc.profileImage) {
    doc.profileImage = `${process.env.BASE_URL}/users/${doc.profileImage}`;
  }
};

userSchema.post("save", (doc) => setImageURL(doc));
userSchema.post("init", (doc) => setImageURL(doc));

userSchema.pre("save", async function (next) {
  // Hashing user password

  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.isPasswordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
