import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Project title required"],
  },
  description: {
    type: String,
    required: [true, "Project Description required"],
  },
  technology: {
    type: Array,
    required: [true, "project the technology required"],
  },
  image: {
    type: String,
  },
});

const projectModel = mongoose.model("projects", projectSchema);

export default projectModel;
