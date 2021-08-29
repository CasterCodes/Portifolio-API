import express from "express";
const router = express.Router();

import {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  acceptUserAsPublisher,
  updateMe,
  resizeUploadFile,
  uploadDisplayPicture,
} from "../controllers/usersController.js";
import {
  login,
  signup,
  confirmEmail,
  protect,
  forgotPassword,
  resetPassword,
  logout,
  authorize,
} from "../controllers/authController.js";

// users
router.route("/").get(protect, authorize("admin"), getAllUsers);
router
  .route("/:id")
  .get(protect, authorize("admin"), getSingleUser)
  .patch(protect, authorize("admin"), updateUser)
  .delete(protect, authorize("admin"), deleteUser);

router
  .route("/upgrade-user/:id")
  .patch(protect, authorize("admin"), acceptUserAsPublisher);
router
  .route("/user/update-me")
  .patch(protect, resizeUploadFile, uploadDisplayPicture, updateMe);

// auth
router.route("/login").post(login);
router.route("/signup").post(signup);
router.route("/forgotpassword").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/me/logout").get(logout);
router.route("/confirm-email/:token").get(confirmEmail);

export default router;
