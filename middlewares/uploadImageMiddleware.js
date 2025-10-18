const multer = require("multer");

const ApiError = require("../utils/ApiError");

const multerOptions = () => {
  // 1-DiskStorage engine
  // const multerStorage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null, "uploads/categories");
  //   },
  //   filename: (req, file, cb) => {
  //     const ext = file.mimetype.split("/")[1];
  //     const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;
  //     cb(null, filename);
  //   },
  // });

  // 2-Memory storage engine
  const multerStorage = multer.memoryStorage();

  // File filter
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("only image allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);
