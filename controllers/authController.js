import HandleAsync from "../utils/handleAsync.js";
import AppError from "../utils/appError.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import Email from "../utils/email.js";
import crypto from "crypto";

export const signup = HandleAsync(async (req, res, next) => {
  const newUser = await userModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  // send email for email confirmation
  const emailToken = newUser.createConfirmEmailToken();

  const url = `${req.protocol}://${req.get(
    "host"
  )}/api/users/confirm-email/${emailToken}`;

  const message = `You are receiving this email because you need to confirm you email address. Use this url \n\n ${url}`;

  await newUser.save({ validateBeforeSave: false });

  // remove user password
  newUser.password = undefined;

  try {
    await new Email(newUser, message).sendConfirmEmail();
  } catch (error) {
    return next(
      new AppError("There was an error sending email.Please try again!", 500)
    );
  }

  const token = await jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRES,
  });

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
    token: token,
    result: {
      user: newUser,
    },
  });
});

export const login = HandleAsync(async (req, res, next) => {
  const { password, email } = req.body;
  if (!password || !email)
    return next(new AppError("Please provide email and password", 400));

  const user = await userModel.findOne({ email: email }).select("+password");

  const ispasswordCorrect = await user.correctPassword(password, user.password);

  if (!user || !ispasswordCorrect)
    return next(new AppError("Incorrect password or email", 400));

  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRES,
  });

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    token: token,
    result: {
      user,
    },
  });
});

export const confirmEmail = HandleAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) return next(new AppError("Invalid token", 400));

  const splitToken = token.split(".")[0];

  const confirmEmailToken = crypto
    .createHash("sha256")
    .update(splitToken)
    .digest("hex");
  console.log(confirmEmailToken);

  const user = await userModel.findOne({
    confirmEmailToken,
    isEmailConfirmed: false,
  });

  if (!user) return next(new AppError("Invalid no user Token", 400));

  user.confirmEmailToken = undefined;

  user.isEmailConfirmed = true;

  await user.save({ validateBeforeSave: false });

  const tokenRes = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRES,
  });

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    token: tokenRes,
    result: {
      user,
    },
  });
});

export const protect = HandleAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError(
        "You are not logged in. Please login to access resources",
        401
      )
    );
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await userModel.findById(decoded.id);

  if (!currentUser)
    return next(new AppError("You are not recognized by the system", 401));

  req.user = currentUser;

  next();
});

export const forgotPassword = HandleAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError("Please provide your email", 400));

  const user = await userModel.findOne({ email: email });

  if (!user) return next(new AppError("No user with that account! Sorry", 404));

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/users/reset-password/${resetToken}`;

  const message = `You requested to change your password. Please use this url ${resetUrl}`;
  try {
    await new Email(user, message).sendResetPassword();
  } catch (error) {
    user.passwordResetToken = undefined;
    user.resetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending email.Please try again!", 500)
    );
  }
  res.status(200).json({
    status: "success",
    message: "forgot password routte",
  });
});

export const resetPassword = HandleAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await userModel.findOne({
    passwordResetToken: hashedToken,
    resetTokenExpiresIn: { $gt: Date.now() },
  });

  if (!user)
    return next(new AppError("Your token has expired or it is invalid"));

  user.password = req.body.password;

  user.confirmPassword = req.body.confirmPassword;

  user.passwordResetToken = undefined;

  user.resetTokenExpiresIn = undefined;

  await user.save();

  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRES,
  });

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Password reset was a success",
    token: token,
  });
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("You are not allowed to perform this action"));
    next();
  };
};

export const logout = HandleAsync(async (req, res, next) => {
  res.cookie("jwt", null, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Logged Out",
  });
});
