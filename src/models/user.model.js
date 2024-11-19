import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true, // this will help to while searching in database
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      lowercase: true,
    },
    avtar: {
      type: String, // we will get link from third party like cloundnery
      required: true,
    },
    coverImage: {
      type: String, // we will get link from third party like cloundnery
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken : {
      type : String
    }
  },
  { timestamps: true },
);
// remember to use the real funcion defination except the arrow funcion because it does not give the functionality of this
userSchema.pre("save", async function (next) {
  //because it always encrypt the password when the something is changed so we need to check when to encrypt the password
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
// mongoose give us the power to create custom methods
userSchema.methods.isPasswordCorrect = async function (password) {
  await bcrypt.compare(password, this.password);
};

userSchema.methods.genrateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.genrateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

export const User = mongoose.model("User", userSchema);
