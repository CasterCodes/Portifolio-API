import express from "express";

const router = express.Router();

import {
  getAllPosts,
  getSinglePost,
  deletePost,
  updatePost,
  createPost,
  getSinglePostById,
  uploadPostSingleImage,
  uploadSingleFile,
  uploadMultipleFiles,
  uploadResizeFile,
  publishBlogPost,
} from "../controllers/postsController.js";

import { protect, authorize } from "../controllers/authController.js";

router
  .route("/")
  .post(
    protect,
    authorize("admin", "publisher"),
    uploadMultipleFiles,
    createPost
  )
  .get(getAllPosts);
router
  .route("/:id")
  .delete(protect, authorize("admin", "publisher"), deletePost)
  .patch(protect, authorize("admin", "publisher"), updatePost);
router.route("/post/:id").get(getSinglePostById);
router.route("/:slug").get(getSinglePost);
router
  .route("/publish/:id")
  .patch(protect, authorize("admin"), publishBlogPost);
router
  .route("/image")
  .post(uploadResizeFile, uploadSingleFile, uploadPostSingleImage);
export default router;
