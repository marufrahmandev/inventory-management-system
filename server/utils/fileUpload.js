const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 10000);
    const uploadedFileName =
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1];
    cb(null, uploadedFileName);
  },
});

const upload = multer({ storage: storage });

const uploadSingleFile = upload.single("file");
const uploadNone = upload.none();
// For products: main image (required) + gallery images (optional)
const uploadProductFiles = upload.fields([
  { name: "product_image", maxCount: 1 }, // Main product image (required)
  { name: "product_gallery", maxCount: 10 }, // Gallery images (optional, max 10)
]);

function storeSingleFile(req, res, next) {
  return new Promise((resolve, reject) => {
    return uploadSingleFile(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.log("multer.MulterError>>>>>>>>");
        reject(err);
      } else if (err) {
        console.log("else multer.MulterError>>>>>>>>");
        reject(err);
      }
      resolve({
        message: "File uploaded successfully",
        body: req.body,
        file: req.file ? req.file : null,
      });
    });
  });
}

function storeProductFiles(req, res, next) {
  return new Promise((resolve, reject) => {
    return uploadProductFiles(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.log("multer.MulterError for product files>>>>>>>>", err);
        reject(err);
      } else if (err) {
        console.log("else multer.MulterError for product files>>>>>>>>", err);
        reject(err);
      }
      resolve({
        message: "Files uploaded successfully",
        body: req.body,
        files: req.files ? req.files : null,
      });
    });
  });
}

module.exports = {
  upload,
  uploadSingleFile,
  uploadNone,
  storeSingleFile,
  storeProductFiles,
};

