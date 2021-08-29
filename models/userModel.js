import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User name is required"],
  },
  email: {
    type: String,
    required: [true, "User email is required"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "User password is required"],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords should be the same",
    },
  },
  photo: {
    type: String,
  },
  passwordResetToken: {
    type: String,
  },
  resetTokenExpiresIn: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  confirmEmailToken: {
    type: String,
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["admin", "user", "publisher"],
    default: "user",
  },
});

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }

    const salt = await bcrypt.genSalt(12);

    this.password = await bcrypt.hash(this.password, salt);

    this.confirmPassword = undefined;

    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenExpiresIn = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
userSchema.methods.correctPassword = async function (
  candidatePassword,
  dbPassword
) {
  return bcrypt.compare(candidatePassword, dbPassword);
};

userSchema.methods.createConfirmEmailToken = function () {
  const confirmToken = crypto.randomBytes(32).toString("hex");

  this.confirmEmailToken = crypto
    .createHash("sha256")
    .update(confirmToken)
    .digest("hex");

  const confirmTokenExtend = crypto.randomBytes(100).toString("hex");

  return `${confirmToken}.${confirmTokenExtend}`;
};

const userModel = mongoose.model("users", userSchema);
export default userModel;
