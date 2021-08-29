import HandleAsync from "../utils/handleAsync.js";
import AppError from "../utils/appError.js";
import userModel from "../models/userModel.js";
import Email from "../utils/email.js";
import FileUpload from "../utils/fileUpload.js";

const upload = new FileUpload({
  folder: "users",
  resize: false,
  height: 500,
  width: 500,
  multiple: false,
});

export const uploadDisplayPicture = upload.singleFile();

export const resizeUploadFile = async (req, res, next) =>
  await upload.resizeFile(req, res, next);

export const getAllUsers = HandleAsync(async (req, res, next) => {
  const users = await userModel.find({});
  res.status(200).json({
    status: "sucess",
    count: users.length,
    result: {
      users,
    },
  });
});

export const getSingleUser = HandleAsync(async (req, res, next) => {
  const user = await userModel.findById(req.params.id);
  if (!user) return next(new AppError("No Project with that id", 404));
  res.status(200).json({
    status: "success",
    result: {
      user: user,
    },
  });
});

export const deleteUser = HandleAsync(async (req, res, next) => {
  const user = await userModel.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("No user with that id", 404));
  res.status(200).json({
    status: "success",
    message: "Resource was deleted",
  });
});

export const updateUser = HandleAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "update user route",
  });
});

export const acceptUserAsPublisher = HandleAsync(async (req, res, next) => {
  if (!req.body.role)
    return next(new AppErro("Please provide the role of the user", 400));
  const user = await userModel.findByIdAndUpdate(req.params.id, {
    role: req.body.role,
  });

  if (!user) return next(new AppError("No user with that id", 404));
  const message = `Hi, ${user.name} have been accepted to be a writer at castercodes`;
  try {
    await new Email(user, message).sendAcceptedEmail();
  } catch (error) {
    return next(
      new AppError("There was an error sending email.Please try again!", 500)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Update user upgraded",
    result: {
      user,
    },
  });
});
const filteredObj = (body, ...allowedUpdates) => {
  const allowedObj = {};
  Object.keys(body).forEach((elem) => {
    if (allowedUpdates.includes(elem)) allowedObj[elem] = body[elem];
  });

  return allowedObj;
};
export const updateMe = HandleAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(
      new AppError("You can not update your password with this route", 403)
    );

  const filtered = filteredObj(req.body, "name", "email");

  if (req.file) filtered.photo = req.file.filename;

  const user = await userModel.findByIdAndUpdate(req.user._id, filtered, {
    new: true,
    runValidators: true,
  });

  if (!user)
    return next(new AppError("You need to login to perform this action"));

  res.status(200).json({
    status: "success",
    message: "Info updated",
    result: {
      user,
    },
  });
});
