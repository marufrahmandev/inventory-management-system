require('dotenv').config();
const http = require("http");
const express = require("express");
const multer = require("multer");
const axios = require("axios");
var cors = require("cors");
const app = express();
const fs = require("fs");
const path = require("path"); 
const { getAllCategories, getCategoryById, updateCategoryById, insertCategory, deleteCategoryById } = require("./category");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.static("uploads"));

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    console.log(
      "Inside storage filename function>>>>>>>>>>>>>",
      file.fieldname
    );
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 10000);
    const uploadedFileName =
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1];
    cb(null, uploadedFileName);
  },
});

const upload = multer({ storage: storage });

const uploadfile = multer({ storage: storage }).single("file");

const uploadnone = multer({ storage: storage }).none();

function storeSingleFile(req, res, next) {
  return new Promise((resolve, reject) => {
    return uploadfile(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.log("multer.MulterError>>>>>>>>");
      } else if (err) {
        console.log("else multer.MulterError>>>>>>>>");
      }
      resolve({
        message: "Categories111 fetched successfully",
        body: req.body,
        file: req.file ? req.file : null,
      });
    });
  });
}

async function uploadImageToCloudinary(category_id, filename) {
  console.log("Inside uploadImageToCloudinary", category_id, filename);
  const filePath = path.join(__dirname, "uploads", filename);
  console.log("filePath", filePath);
  console.log("fileExists", fs.existsSync(filePath));
  try {
    const file = `./uploads/${filename}`;
    console.log("file", file);
    const uploadedImageResult = await cloudinary.uploader.upload(
        file,
        //{ timeout: 600000 } // 10 minutes
    );
    console.log(uploadedImageResult);
    const optimizedImageUrl = cloudinary.url(uploadedImageResult.public_id, {
      //timeout: 600000, // 10 minutes
      transformation: [
        {
          quality: "auto",
          fetch_format: "auto",
        },
        {
          width: 200,
          height: 200,
          crop: "fill",
          gravity: "auto",
        },
      ],
    });
    console.log(optimizedImageUrl);

    const updatedData = {
      optimizedImageUrl: optimizedImageUrl || "",
      secureUrl: uploadedImageResult?.secure_url || "",
      publicId: uploadedImageResult?.public_id || "",
      imagesDisplayName: uploadedImageResult?.display_name || "",
      imageUrl: uploadedImageResult?.url || "",
    };

    const updatedCategory = await updateCategoryById("categories", category_id, updatedData);
    console.log(updatedCategory);

    try {
      fs.unlinkSync(path.join(__dirname, "uploads", filename));
    } catch (error) {
      console.log("Error in deleting category image", error);
    }

    const responseData = await insertCategory("images", {
      category_id: category_id,
      optimizedImageUrl,
      ...uploadedImageResult,
    });
    console.log(responseData);
    return true;
  } catch (error) {
    console.log("Error in uploading image to cloudinary", error);
    return false;
  }
  finally{
    console.log("Image uploaded to cloudinary successfully");
    return true;
  }
}

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello World",
  });
});

app.get("/categories", async (req, res) => {
  let categories = await getAllCategories("categories");

  if (categories.length > 0) {
    categories = categories.map((item) => {
      return {
        ...item,
        category_image_url: `http://localhost:3000/${item.category_image}`,
      };
    });
  }

  return res.status(200).json(categories);
});

const imageMimeTypeMap = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  tiff: "image/tiff",
};
app.get("/categories/:id", async (req, res) => {
  const { id } = req.params;
  const data = await getCategoryById("categories", id);

  if (data.category_image) {
    data.category_image_url = `http://localhost:3000/uploads/${data.category_image}`;

    try {
      const filePath = path.join(__dirname, "uploads", data.category_image);
      const imageMimeType = imageMimeTypeMap[data.category_image.split(".")[1]];
      const imageBuffer = fs.readFileSync(filePath);
      const base64Image = imageBuffer.toString("base64");
      data.category_image_base64 = `data:${imageMimeType};base64,${base64Image}`;
    } catch (error) {
      console.log("Error in getting category image base64", error);
    }
  }

  return res.status(200).json(data);
});

app.post("/categories", async (req, res, next) => {

  try{
    
  const data = await storeSingleFile(req, res, next);

  console.log("Inside controller req.body", req.body);
  console.log("Inside controller req.file", req.file);

  const { name = "", description = "", parent_category = null } = req.body;

  const requestData = {
    name,
    description,
    parent_category,
    category_image: req.file ? req.file.filename : null,
  };

  const responseData = await insertCategory("categories", requestData);

  console.log({ responseData });

   
  if (req.file && req.file.filename && responseData?.id) {
    const isImageUploaded = await uploadImageToCloudinary(responseData.id, req.file.filename);
    console.log({ isImageUploaded });

  }



    return res.status(200).json(responseData);

  }
  catch(error){
    console.log("Error in creating category", error);
    return res.status(500).json({
      message: "Error in creating category",
      error: error.message,
    });
  }
});

app.put("/categories/:id", async (req, res, next) => {
  const { id } = req.params;

  const data = await storeSingleFile(req, res, next);

  console.log("Inside controller req.body", req.body);
  console.log("Inside controller req.file", req.file);

  const {
    name = "",
    description = "",
    parent_category = null,
    category_image = null,
  } = req.body;

  const requestData = {
    name,
    description,
    parent_category,
    category_image: req.file ? req.file.filename : category_image,
  };

  const responseData = await updateCategoryById("categories", id, requestData);

  return res.status(200).json(responseData);
});

app.delete("/categories/:id", async (req, res, next) => {
  const { id } = req.params;
  const category = await getCategoryById("categories", id);
  console.log("category", category);
  if (category.category_image) {
    try{
      if(category?.publicId){
        const deletedImage = await cloudinary.uploader.destroy(category?.publicId, {
              resource_type: 'image',
        });
        console.log(deletedImage);
      }
    }catch(error){
      console.log("Error in deleting image from cloudinary", error);
    }
    try {
      fs.unlinkSync(path.join(__dirname, "uploads", category.category_image));
    } catch (error) {
      console.log("Error in deleting category image", error);
    }
  }
  const responseData = await deleteCategoryById("categories", id);  
  return res.status(200).json(responseData);
});

// app.post("/categories", upload.none(), (req, res, next) => {

//     return res.status(200).json({
//         message: "Categories fetched successfully",
//         body: req.body,
//     });
// });

app.get("/products", async (req, res) => {
  const data = await getAllCategories("products");

  return res.status(200).json(data);
});

// app.post("/profile", upload.single("file"), (req, res) => {
//   try {
//     console.log(req.file);
//     console.log(req.body);
//     //res.send('Hello World');
//     return res.status(200).json({
//       message: "File uploaded successfully",
//       file: req.file,
//       body: req.body,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Internal server error");
//   }
// });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// app.timeout = 10 * 60 * 1000; // Increase timeout → 10 minutes

// Create Node.js server from Express app
// const server = http.createServer(app);

// // Set timeout to 10 minutes (600000 ms)
// server.timeout = 10 * 60 * 1000;

// // Start server
// server.listen(3000, () => {
//   console.log("Server is running on port 3000 with 10 min timeout");
// });