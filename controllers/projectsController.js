import HandleAsync from "../utils/handleAsync.js";
import AppError from "../utils/appError.js";
import projectModel from "../models/ProjectsModel.js";

//  @desc - Get  all  projects
// @route - /api/projects/:id
// @access - private
export const getAllProjects = HandleAsync(async (req, res, next) => {
  const projects = await projectModel.find({});
  res.status(200).json({
    status: "sucess",
    count: projects.length,
    result: {
      projects,
    },
  });
});

// @desc - Get a single  project
// @route - /api/projects/:id
// @access - private

export const getSingleProject = HandleAsync(async (req, res, next) => {
  const project = await projectModel.findById(req.params.id);
  if (!project) return next(new AppError("No Project with that id", 404));
  res.status(200).json({
    status: "success",
    result: {
      project: project,
    },
  });
});

// @desc - Create a project
// @route - /api/projects
// @access - private
export const createProject = HandleAsync(async (req, res, next) => {
  const project = await projectModel.create(req.body);
  res.status(200).json({
    status: "success",
    result: {
      project: project,
    },
  });
});

// @desc - Delete a project
// @route - /api/projects/:id
// @access - Private
export const deleteProject = HandleAsync(async (req, res, next) => {
  const project = await projectModel.findByIdAndDelete(req.params.id);
  if (!project) return next(new AppError("No Project with that id", 404));
  res.status(200).json({
    status: "success",
    message: "Resource was deleted",
  });
});
// @desc - update  a project
// @route - /api/projects/:id
// @access - Private
export const updateProject = HandleAsync(async (req, res, next) => {
  const updatedProject = await projectModel.findByIdAndUpdate(
    req.params.id,
    req.body
  );

  if (!updatedProject)
    return next(new AppError("No project with that id", 404));

  res.status(200).json({
    status: "success",
    result: {
      updatedProject,
    },
  });
});
