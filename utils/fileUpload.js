import mutler from "multer";
import sharp from "sharp";
import AppError from "./appError.js";
class Upload {
  constructor(params) {
    this.params = params;
    this.folder = this.params.folder;
    this.upload = mutler({
      storage: this.fileStorage(),
      fileFilter: this.fileFilter(),
    });
  }

  fileStorage() {
    if (this.params.resize) {
      return mutler.memoryStorage();
    }
    return mutler.diskStorage({
      destination: (req, file, callback) => {
        callback(null, `uploads/images/${this.folder}`);
      },
      filename: (req, file, callback) => {
        const ext = file.mimetype.split("/")[1];
        callback(null, `image-${Date.now()}.${ext}`);
      },
    });
  }
  async resizeFile(req, res, next) {
    try {
      if (!this.params.resize) return next();
      if (this.params.multiple) {
        if (!req.files.coverImage || !req.files.images) return next();
        // cover image
        const imageCoverFileName = `image-${Date.now()}-cover.jpeg`;
        await sharp(req.files.coverImage[0].buffer)
          .resize(this.params.height, this.params.width)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/images/${this.folder}/${imageCoverFileName}`);
        req.body.coverImage = imageCoverFileName;

        // images
        req.body.images = [];
        await Promise.all(
          req.files.images.map(async (file, index) => {
            const filename = `images-${Date.now()}-${index + 1}.jpeg`;
            await sharp(file.buffer)
              .resize(this.params.height, this, params.width)
              .toFormat("jpeg")
              .jpeg({ quality: 90 })
              .toFile(`uploads/images/${this.folder}/${filename}`);
            req.body.images.push(filename);
          })
        );
      } else {
        req.file.filename = `image-${Date.now()}.jpeg`;
        await sharp(req.file.buffer)
          .resize(this.params.height, this.params.width)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/images/${this.folder}/${req.file.filename}`);
      }
    } catch (error) {
      return next(new AppError("Something went wrong", 400));
    }

    return next();
  }
  fileFilter() {
    return (req, file, callback) => {
      if (file.mimetype.startsWith("image")) {
        callback(null, true);
      } else {
        callback(new AppError("File not image", 400), false);
      }
    };
  }

  singleFile() {
    return this.upload.single("photo");
  }

  multipleFiles() {
    return this.upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "images", maxCount: 10 },
    ]);
  }
}

export default Upload;
