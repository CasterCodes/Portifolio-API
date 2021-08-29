import postModel from "../models/PostsModel.js";
import HandleAysnc from "../utils/handleAsync.js";
import AppError from "../utils/appError.js";
import FileUpload from "../utils/fileUpload.js";
import Email from "../utils/email.js";

const upload = new FileUpload({
  folder: "posts",
  resize: false,
  height: 2000,
  width: 1333,
  multiple: true,
});

// @desc  get all posts
// @route  /api/blogs
// @accesss Public
export const getAllPosts = HandleAysnc(async (req, res, next) => {
  const posts = await postModel.find({});
  res.status(200).json({
    status: "success",
    count: posts.length,
    result: {
      posts: posts,
    },
  });
});

// @desc - Get a single blog post using slug
// @route - /api/blogs/:slug
// @acess - Public

export const getSinglePost = HandleAysnc(async (req, res, next) => {
  const post = await postModel.findOne({ slug: req.params.slug });
  if (!post) return next(new AppError("No blog post with that slug", 404));
  res.status(200).json({
    status: "success",
    result: {
      post: post,
    },
  });
});
// @desc - Delete a blog post
// @route - /api/blogs/:id
// @access - private

export const deletePost = HandleAysnc(async (req, res, next) => {
  const post = await postModel.findByIdAndDelete(req.params.id);
  if (!post) return next(new AppError("No blog post with that id", 404));
  res.status(200).json({
    status: "success",
    message: `Blog post was deleted`,
  });
});
// @desc - update a blog post
// @route - /api/blogs/:id
// @access - private
export const updatePost = HandleAysnc(async (req, res, next) => {
  const updatedPost = await postModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedPost) return next(new AppError("No blog post with that id", 404));
  res.status(200).json({
    status: "success",
    post: updatedPost,
  });
});

// @desc - create a blog post
// @route - /api/blogs/:id
// @access - private
export const createPost = HandleAysnc(async (req, res, next) => {
  let images = [];
  if (req.files.images)
    req.files.images.forEach((image) => images.push(image.filename));

  const post = await postModel.create({
    title: req.body.title,
    body: req.body.body,
    description: req.body.description,
    coverImage: req.files.coverImage[0].filename || req.body.coverImage,
    images: images || req.body.images,
  });
  res.status(200).json({
    status: "success",
    message: "Blog  post was created",
    post: post,
  });
});

// @desc -  single blog post using id
// @route - /api/blogs/:id
// @access - public
export const getSinglePostById = HandleAysnc(async (req, res, next) => {
  const post = await postModel.findById(req.params.id);
  if (!post) return next(new AppError("No blog post with that id", 404));
  res.status(200).json({
    status: "success",
    result: {
      post: post,
    },
  });
});

export const publishBlogPost = HandleAysnc(async (req, res, next) => {
  const post = await postModel.findByIdAndUpdate(req.params.id, {
    published: true,
  });

  if (!post) return next(new AppError("No post with that id", 404));
  const user = { email: "nyagucha@gmail.com", name: "Priscilla Marembo" };
  const message = `Your article titled ${post.title} was published by the admin`;

  try {
    await new Email(user, message).sendArticlePublished();
  } catch (error) {
    return next(new AppError("There was an erro sending email", 500));
  }

  res.status(200).json({
    status: "success",
    message: "Blog post published",
    result: {
      post: post,
    },
  });
});

// file upload
export const uploadSingleFile = upload.singleFile();
export const uploadMultipleFiles = upload.multipleFiles();
export const uploadResizeFile = async (req, res, next) =>
  await upload.resizeFile(req, res, next);

export const uploadPostSingleImage = HandleAysnc((req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "File was uploaded",
  });
});
