const express = require("express");
const multer = require("multer");
const axios = require("axios");
var cors = require('cors')
const app = express();
const fs = require("fs");
const path = require("path");

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


app.use(express.static('uploads'));





const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
        console.log("Inside storage filename function>>>>>>>>>>>>>", file.fieldname);
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 10000);
        const uploadedFileName = file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1];
        cb(null, uploadedFileName); 
   
  },
});

const upload = multer({ storage: storage });

const uploadfile = multer({ storage: storage }).single('file');

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


app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello World",
  });
});

  app.get("/categories", async (req, res) => {
    const data = await axios
      .get("http://localhost:4000/categories", {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.data);

    return res.status(200).json(data);
  });



  const imageMimeTypeMap = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "svg": "image/svg+xml",
    "tiff": "image/tiff",
  };
app.get("/categories/:id", async (req, res) => {
  const { id } = req.params;
  const data = await axios.get(`http://localhost:4000/categories/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.data);

  if( data.category_image){
      data.category_image_url = `http://localhost:3000/uploads/${data.category_image}`;

      try{
          const filePath = path.join(__dirname, "uploads", data.category_image);
          const imageMimeType = imageMimeTypeMap[data.category_image.split(".")[1]];
          const imageBuffer = fs.readFileSync(filePath);
          const base64Image = imageBuffer.toString("base64");
          data.category_image_base64 = `data:${imageMimeType};base64,${base64Image}`;
      }catch(error){
          console.log("Error in getting category image base64", error);
      }
  }


  return res.status(200).json(data);
});

app.post("/categories", async(req, res, next) => {

    const data = await storeSingleFile(req, res, next);

    console.log("Inside controller req.body", req.body);
    console.log("Inside controller req.file", req.file);

    const {
        name = "",
        description = "",
        parent_category = null,
    } = req.body;

    const requestData = {
        name,
        description,
        parent_category,
        category_image: req.file ? req.file.filename : null,
    };

    const responseData = await axios.post("http://localhost:4000/categories", requestData, {
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => response?.data);

    return res.status(200).json(responseData);

});

app.put("/categories/:id", async(req, res, next) => {

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

    const responseData = await axios.put(`http://localhost:4000/categories/${id}`, requestData, {
        headers: {
            "Content-Type": "application/json",
        },
    }).then((response) => response?.data);

    return res.status(200).json(responseData);

});

app.delete("/categories/:id", async(req, res, next) => {
  const { id } = req.params;
  const category = await axios.get(`http://localhost:4000/categories/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response?.data);
  console.log("category", category);
  if(category.category_image){
    try{
      unlinkSync(path.join(__dirname, "uploads", category.category_image));
      fs.unlinkSync(path.join(__dirname, "uploads", category.category_image));
    }catch(error){
      console.log("Error in deleting category image", error);
    }
  }
  const responseData = await axios.delete(`http://localhost:4000/categories/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: id,
  }).then((response) => response?.data);

  return res.status(200).json(responseData);
});

// app.post("/categories", upload.none(), (req, res, next) => {
   
//     return res.status(200).json({
//         message: "Categories fetched successfully",
//         body: req.body,
//     });
// });

app.get("/products",  async     (req, res) => {
  const data = await axios
    .get("http://localhost:4000/products", {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        category: req.query.category,
      },
    })
    .then((response) => response.data);

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
