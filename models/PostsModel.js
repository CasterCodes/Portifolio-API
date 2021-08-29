import mongoose from "mongoose";
import slugify from "slugify";
import createDomPurify from "dompurify";
import { JSDOM } from "jsdom";
import marked from "marked";
const dompurify = createDomPurify(new JSDOM().window);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      required: [true, "Blog title is required"],
    },
    body: {
      type: String,
      required: [true, "Blog post body is required"],
    },
    markdown: {
      type: String,
      required: [true, "Blog markdown is required"],
    },
    description: {
      type: String,
      required: [true, "Blog description is required"],
    },
    slug: {
      type: String,
      rquired: [true, "Blog slug is required"],
    },
    coverImage: {
      type: String,
    },
    images: {
      type: Array,
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

postSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.body) {
    this.markdown = dompurify.sanitize(marked(this.body));
  }
  console.log("pre save hook");
  next();
});

const postModel = mongoose.model("posts", postSchema);

export default postModel;
