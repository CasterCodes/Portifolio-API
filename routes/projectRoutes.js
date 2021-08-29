import express from "express";
const router = express.Router();
import {
  getAllProjects,
  getSingleProject,
  deleteProject,
  updateProject,
  createProject,
} from "../controllers/projectsController.js";

import { protect, authorize } from "../controllers/authController.js";

router
  .route("/")
  .get(getAllProjects)
  .post(protect, authorize("admin"), createProject);
router
  .route("/:id")
  .delete(protect, authorize("admin"), deleteProject)
  .patch(protect, authorize("admin"), updateProject)
  .get(getSingleProject);

export default router;
