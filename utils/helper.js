async resizeFile(req, res, next)  {
    console.log(req.files);
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