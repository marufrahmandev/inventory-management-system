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

module.exports = {
  upload,
  uploadSingleFile,
  uploadNone,
  storeSingleFile,
};

